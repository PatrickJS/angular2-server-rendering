var fs = require('fs'); // read in template file
var util = require('util'); // used to do JSON.stringify() like thing

console.time('Loading Angular'); // 300ms
// Parse5DomAdapter needs to be before angular2
// this will set the Parse5DomAdapter as the DOM in dom_adapter
// essentially I believe this is our mock DOM perhaps?
var Parse5DomAdapter = require('angular2/src/dom/parse5_adapter').Parse5DomAdapter;
Parse5DomAdapter.makeCurrent();

// get Angular2 libraries that we will use
var ng2 = require('angular2/angular2');             // main lib used when creating compiler
var di = require('angular2/di');                    // only used for view.hydrate(new di.Injector([]), null, component)
var ngDirectives = require('angular2/directives');  // when we compile, we need to make sure core directives available

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
var TemplateResolver = require('angular2/src/core/compiler/template_resolver').TemplateResolver;

// allows us to set the template
// var MockTemplateResolver = require('angular2/src/mock/template_resolver_mock.js').MockTemplateResolver;

// read the annotations from a component
var DirectiveMetadataReader = require('angular2/src/core/compiler/directive_metadata_reader').DirectiveMetadataReader;

// setting URL for a given component
var ComponentUrlMapper = require('angular2/src/core/compiler/component_url_mapper').ComponentUrlMapper;

// referencing the DOM...but this is actually the Parse5DomAdapter that was set earlier
var DOM = require('angular2/src/dom/dom_adapter').DOM;

//var ngCore = require('angular2/core');
//console.log('angular2', ng2, '\n', ngDirectives, '\n', ngCore, '\nparse\n');

/*
console.time('Loading Compiler');
var urlResolver = new UrlResolver();
var tplResolver = new MockTemplateResolver();
var styleUrlResolver = new StyleUrlResolver(urlResolver);
// var styleInliner = new StyleInliner();
var host = DOM.createElement('div');
// create the compiler
var compiler = new ng2.Compiler(
  ng2.dynamicChangeDetection,
  new ng2.TemplateLoader(null, null),
  new DirectiveMetadataReader(),
  new ng2.Parser(new ng2.Lexer()),
  new ng2.CompilerCache(),
  new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, host),
  tplResolver,
  new ComponentUrlMapper(),
  urlResolver,
  new CssProcessor(null)
);
console.timeEnd('Loading Compiler');
*/
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


function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function copyCmp(context) {
  var state = {};
  for (var prop in context) {
    state[prop] = context[prop];
  }
  return state;
}

function wrapper(f, args) {
  return function() {
    f.apply(this, args);
  };
}

function showDebug(options, state) {
  return '\n'+
  '<pre>'+
  'Server = ' + JSON.stringify(options, null, 2)+
  '</pre>'+
  '<pre>'+
  '// Component State'+
  'state = ' + JSON.stringify(state, null, 2)+
  '</pre>';
}

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

  console.time('Read File'); // 2ms
  fs.readFile(filePath, function (err, content) {
    console.timeEnd('Read File');

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

    try {

      var Component = options.Component;

      console.time('Loading Compiler'); // 2ms
      var urlResolver = new UrlResolver();
      // var tplResolver = new MockTemplateResolver();
      var styleUrlResolver = new StyleUrlResolver(urlResolver);
      // var styleInliner = new StyleInliner();
      var hostElement = DOM.createElement(options.selector);
      // create the compiler
      var compiler = new ng2.Compiler(
        ng2.dynamicChangeDetection,
        new ng2.TemplateLoader(null, null),
        new DirectiveMetadataReader(),
        new ng2.Parser(new ng2.Lexer()),
        new ng2.CompilerCache(),
        new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, hostElement),
        // tplResolver,
        new TemplateResolver(),
        new ComponentUrlMapper(),
        urlResolver,
        new CssProcessor(null)
      );
      console.timeEnd('Loading Compiler');


      console.time('Compiling Template');
      // 60-80ms
      compiler.compile(Component).then(function(protoView) {
        console.timeEnd('Compiling Template');
        console.time('Hydrate Template'); // 30ms
        //console.log('before createView(pv)', pv);

        //************ CREATING THE VIEW ***************
        console.time('Instantiate Component'); // 11-20ms
        var component = new (
          wrapper(Component, options.arguments)
        );
        var view = protoView.instantiate(null, null);
        console.timeEnd('Instantiate Component');

        console.time('Hydrate Component'); // 1ms
        view.hydrate(new di.Injector([]), null, null, component, null);
        console.timeEnd('Hydrate Component');

        //TODO: why do we need to detect changes when we should be doing it in one shot?
        var cd = view.changeDetector;
        cd.detectChanges();

        console.time('Serialize Component'); // 1-2ms
        var len = hostElement.children.length;
        for (var i = 0; i < view.nodes.length; i++) {
          hostElement.children[len+i] = view.nodes[i];
        };
        var serializedCmp = ng2string(hostElement);
        // var serializedHost = ng2string(hostElement);
        console.timeEnd('Serialize Component');
        // debugger;
        console.time('Inject Component'); // 0-2ms

        // you can has debugger with node-inspector
        // debugger;

        // <app></app>
        var intro =  '<' + options.selector + '>';
        var outro = '</' + options.selector + '>';

        var selector = intro + outro;

        var regExpSelector = new RegExp(escapeRegExp(selector), 'g');

        var injectContent = serializedCmp;


        // debug info
        // var state = copyCmp(view.context);
        // var debugInfo = showDebug(options, state);

        var rendered = content.toString().replace(regExpSelector, serializedCmp /*+ debugInfo*/);
        console.timeEnd('Inject Component');

        console.timeEnd('Hydrate Template');
        done(null, rendered);
      })
      .catch(function(err) {
        done(err);
      });
    } catch(e) {
      done(e);
    }
  });
};
