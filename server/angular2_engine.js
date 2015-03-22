var fs = require('fs'); // read in template file
var util = require('util'); // used to do JSON.stringify() like thing

// Parse5DomAdapter needs to be before angular2
// this will set the Parse5DomAdapter as the DOM in dom_adapter
// essentially I believe this is our mock DOM perhaps?
console.time('Loading Angular');
var Parse5DomAdapter = require('angular2/src/dom/parse5_adapter').Parse5DomAdapter;
Parse5DomAdapter.makeCurrent();

// Ensure environment is correctly set up before loading angular

var lang = require('angular2/src/facade/lang');
// get Angular2 libraries that we will use
var ng2 = require('angular2/angular2');             // main lib used when creating compiler
var di = require('angular2/di');                    // only used for view.hydrate(new di.Injector([]), null, component)
var ngDirectives = require('angular2/directives');  // when we compile, we need to make sure core directives available

var VmTurnZone = require('angular2/src/core/zone/vm_turn_zone').VmTurnZone
var EventManager = require('angular2/src/core/events/event_manager').EventManager;

// this is passed into the StyleUrlResolver
var UrlResolver = require('angular2/src/core/compiler/url_resolver').UrlResolver;

// this used to create EmulatedUnscopedShadowDomStrategy(styleUrlResolver); used to resolve URLs for styles?
var StyleUrlResolver = require('angular2/src/core/compiler/style_url_resolver').StyleUrlResolver;
// var StyleInliner = require('angular2/src/core/compiler/style_inliner').StyleInliner

// passed into compiler, but not sure what it does; something with emulating the DOM
var shadow_dom_strategy = require('angular2/src/core/compiler/shadow_dom_strategy');
var EmulatedUnscopedShadowDomStrategy = shadow_dom_strategy.EmulatedUnscopedShadowDomStrategy;

// doesn't seem like these are used so commenting it out
//var NativeShadowDomStrategy = shadow_dom_strategy.NativeShadowDomStrategy;
// var EmulatedScopedShadowDomStrategy = shadow_dom_strategy.EmulatedScopedShadowDomStrategy;

// I think used to add styles to web component...how does this work on the server side?
var CssProcessor = require('angular2/src/core/compiler/css_processor').CssProcessor;


// I was not able to see this being used anywhere so commenting it out
//var TemplateResolver = require('angular2/src/core/compiler/template_resolver').TemplateResolver;

// allows us to set the template
var MockTemplateResolver = require('angular2/src/mock/template_resolver_mock.js').MockTemplateResolver;

// read the annotations from a component
var DirectiveMetadataReader = require('angular2/src/core/compiler/directive_metadata_reader').DirectiveMetadataReader;

// setting URL for a given component
var ComponentUrlMapper = require('angular2/src/core/compiler/component_url_mapper').ComponentUrlMapper;

// referencing the DOM...but this is actually the Parse5DomAdapter that was set earlier
var DOM = require('angular2/src/dom/dom_adapter').DOM;

//var ngCore = require('angular2/core');
//console.log('angular2', ng2, '\n', ngDirectives, '\n', ngCore, '\nparse\n');

var urlResolver = new UrlResolver();
var tplResolver = new MockTemplateResolver();
var styleUrlResolver = new StyleUrlResolver(urlResolver);
// var styleInliner = new StyleInliner();

// create the compiler
var compiler = new ng2.Compiler(
  ng2.dynamicChangeDetection,
  new ng2.TemplateLoader(null, null),
  new DirectiveMetadataReader(),
  new ng2.Parser(new ng2.Lexer()),
  new ng2.CompilerCache(),
  new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, {firstChild: null}),
  tplResolver,
  new ComponentUrlMapper(),
  urlResolver,
  new CssProcessor(null)
);
console.timeEnd('Loading Angular');
// HTML parser (not used right now)
//var parse5 = require('parse5');
//var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
//var serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
//var treeAdapter = parser.treeAdapter;

// var temp = treeAdapter.createElement("template", null, []);
// treeAdapter.appendChild(temp, view.nodes[0]);
// var serialized = serializer.serialize(temp);
// var newParser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
// return newParser.parseFragment(serialized).childNodes[0];

var ng2string = require('./ng2string');

/**
 * This is the actual template engine where all the magic happens
 * @param filePath
 * @param options
 * @param done
 */
module.exports = function ng2Engine(filePath, options, done) {


  // read in the server side template file
  //TODO: need to implement routing so we can use that instead of express router (express router simple * to angular router)
  //TODO: HOWEVER, we do have to account for the fact that the main page wrapper is server side only
  fs.readFile(filePath, function (err, content) {

    // if error while reading file, then throw error
    if (err) { return done(new Error(err)); }


    // set the template in the resolver (which is used within the compile)
    // only needed if we want to overwrite template annotation
    // var template = new ng2.Template({
    //     inline:     cmp.template,
    //     directives: [ngDirectives.If]
    // });
    // tplResolver.setTemplate(MyComponent, template);

    // compile the component and get the protoView
    var Component = options.Component;
    console.time('Compiling Template');
    compiler.compile(Component).then(function(protoView) {
      //console.log('before createView(pv)', pv);

      function wrapper(f, args) {
        return function() {
          f.apply(this, args);
        };
      }

      //************ CREATING THE VIEW ***************
      var component = new (
        wrapper(Component, options.arguments)
      );
      var view = protoView.instantiate(null, null);
      view.hydrate(new di.Injector([]), null, component);

      //TODO: why do we need to detect changes when we should be doing it in one shot?
      var cd = view.changeDetector;
      cd.detectChanges();

      var serializedCmp = ng2string(view.nodes);

      function copyCmp(context) {
        var state = {};
        for (var prop in context) {
          state[prop] = context[prop];
        }
        return state;
      }

      var state = copyCmp(view.context);
      // console.log('serializedCmp\n', serializedCmp);

      // you can has debugger with node-inspector
      // debugger;

      // <app></app>
      var intro =  '<' + options.selector + '>';
      var outro = '</' + options.selector + '>';

      var selector = intro + outro;

      function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      }

      var regExpSelector = new RegExp(escapeRegExp(selector), 'g');

      var linkStyles = '<link rel="stylesheet" href="css/base.css" media="screen" title="no title" charset="utf-8">'
      var styles = '<style>@import "css/base.css";</style>'

      var injectContent = intro + styles + serializedCmp + outro;


      // debug info
      var debugInfo = '\n'+
      '<pre>'+
      'Server = ' + JSON.stringify(options, null, 2)+
      '</pre>'+
      '<pre>'+
      '// Component State'+
      'state = ' + JSON.stringify(state, null, 2)+
      '</pre>';

      console.timeEnd('Compiling Template');
      var rendered = content.toString().replace(regExpSelector, injectContent /*+ debugInfo*/);

      done(null, rendered);
    });
  });
};
