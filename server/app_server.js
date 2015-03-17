var express = require('express');
var serveStatic = require('serve-static');
var morgan  = require('morgan');
var fs = require('fs');
var router = require('express').Router();
var path = require('path');
var util = require('util');
// var jsdom = require("jsdom");


// Parse5DomAdapter needs to be before angular2
var Parse5DomAdapter = require('angular2/src/dom/parse5_adapter').Parse5DomAdapter;
Parse5DomAdapter.makeCurrent();

var cmp = require('../dist/app.node.es6.js');
var cmpApp = cmp.App;



var ng2 = require('angular2/angular2');
var ngCore = require('angular2/core');
var di = require('angular2/di');
var ngDirectives = require('angular2/directives');


var UrlResolver = require('angular2/src/core/compiler/url_resolver').UrlResolver;
var CssProcessor = require('angular2/src/core/compiler/css_processor').CssProcessor;
var StyleUrlResolver = require('angular2/src/core/compiler/style_url_resolver').StyleUrlResolver;
var TemplateResolver = require('angular2/src/core/compiler/template_resolver').TemplateResolver;
var MockTemplateResolver = require('angular2/src/mock/template_resolver_mock.js').MockTemplateResolver;
var DirectiveMetadataReader = require('angular2/src/core/compiler/directive_metadata_reader').DirectiveMetadataReader;

var shadow_dom_strategy = require('angular2/src/core/compiler/shadow_dom_strategy');
var NativeShadowDomStrategy = shadow_dom_strategy.NativeShadowDomStrategy;
var EmulatedScopedShadowDomStrategy = shadow_dom_strategy.EmulatedScopedShadowDomStrategy;
var EmulatedUnscopedShadowDomStrategy = shadow_dom_strategy.EmulatedUnscopedShadowDomStrategy;

var ComponentUrlMapper = require('angular2/src/core/compiler/component_url_mapper').ComponentUrlMapper;
var DOM = require('angular2/src/dom/dom_adapter').DOM;

// di.bind(ngDom.DomAdapter).toClass(Parse5DomAdapter);

// var DOM = require('angular2/src/dom/dom_adapter');
// DOM.setRootDomAdapter()


// var ComponentUrlMapper = require('angular2/src/core/compiler/component_url_mapper').ComponentUrlMapper;


var view, cd, compiler, component, tplResolver;
// var app = new App();
console.log('angular2', ng2, '\n', ngDirectives, '\n', ngCore, '\nparse\n');

// console.log('module', System);
// System('app.es6').then(function(module) {

// });

var urlResolver = new UrlResolver();

tplResolver = new MockTemplateResolver();
var styleUrlResolver = new StyleUrlResolver(urlResolver);

compiler = new ng2.Compiler(
  ng2.dynamicChangeDetection,
  new ng2.TemplateLoader(null, null),
  new DirectiveMetadataReader(),
  new ng2.Parser(new ng2.Lexer()),
  new ng2.CompilerCache(),
  new EmulatedUnscopedShadowDomStrategy(styleUrlResolver),
  tplResolver,
  new ComponentUrlMapper(),
  urlResolver,
  new CssProcessor(null)
);

function createView(Cmp, pv) {
  console.log('createView');
  component = new Cmp();
  console.log('new component');
  view = pv.instantiate(null, null);
  console.log('pv.instantiate');
  view.hydrate(new di.Injector([]), null, component);
  console.log('view.hydrate');
  cd = view.changeDetector;
  console.log('view.changeDetector');
}

function compileWithTemplate(component, directives, html) {
  console.log('compileWithTemplate');

  var template = new ng2.Template({
    inline: html,
    directives: [
      (directives) ? directives : []
    ]
  });
  tplResolver.setTemplate(component, template);
  return compiler.compile(component);
}
module.exports = function(ROOT) { // jshint ignore:line
  var app = express();

  if (process.env.NODE_ENV !== 'development') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }
  // console.log('angular2', ng2);
  // console.log('di', di);
  var parse5 = require('parse5');
  var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
  var serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
  var treeAdapter = parser.treeAdapter;

  app.engine('ng2.html', function (filePath, options, callback) { // define the template engine
    fs.readFile(filePath, function (err, content) {
      if (err) return callback(new Error(err));

      // var cmpApp = new cmp.App();
      // var tmp = compiler.compile(cmp.App);
      // console.log('tmp', DOM.getText(tmp));


      console.log('starting');
      compileWithTemplate(cmpApp, ngDirectives.If, cmp.template).then(function(pv) {
        console.log('before createView(pv)', pv);
        createView(cmpApp, pv);
        console.log('createView(pv)');
        cd.detectChanges();
        console.log('view',
          view, '\n'
        );

        console.log('view',
          'VIEW:\n',
          view.nodes[0].html,
          '\ngetInnerHTML:\n',
          DOM.getInnerHTML(pv.element), '\n',
          '\ngetOuterHTML:\n',
          DOM.getOuterHTML(pv.element),
          '\nview.nodes[0].childNodes[0]:\n'
          // view.nodes[0].childNodes[0]
          // util.inspect(DOM.getOuterHTML(view.nodes[0]), {
          //   showHidden: true, depth: null
          // })
        );
        // var temp = treeAdapter.createElement("template", null, []);
        // treeAdapter.appendChild(temp, view.nodes[0]);
        // var serialized = serializer.serialize(temp);
        // var newParser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
        // return newParser.parseFragment(serialized).childNodes[0];

        var rendered = content.toString().
        replace('__ServerRendered__',
          '<app>'+
          '</app>'+
          DOM.getOuterHTML(pv.element)+
          // serialized+
          '\n'+
          '<pre>'+
            JSON.stringify(options, null, 2)+
          '</pre>'
        );

        callback(null, rendered);
      });

      // return
    });
  });


  app.set('views', path.join(ROOT, 'src')); // specify the views directory
  app.set('view engine', 'ng2.html'); // register the template engine
  app.set('view options', { doctype: 'html' });


  router.route('/')
  .get(function(req, res) {
    res.render('index', {yolo: 'yolo'});
  });

  app.use(router);


  app.use(serveStatic(ROOT + '/dist'));


  return app;
};
