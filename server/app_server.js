var express = require('express');
var serveStatic = require('serve-static');
var morgan  = require('morgan');
var fs = require('fs');
var router = require('express').Router();
var path = require('path');
// var jsdom = require("jsdom");

// var System = require('es6-module-loader').System;
var App = require('../dist/app.es6.js');
// var angular2 = require('../dist/lib/angular2.js');

var ng2 = require('angular2/angular2');
var ngCore = require('angular2/core');
var di = require('angular2/di');
var ngDirectives = require('angular2/directives');


var UrlResolver = require('angular2/src/core/compiler/url_resolver').UrlResolver;
var CssProcessor = require('angular2/src/core/compiler/css_processor').CssProcessor;
var StyleUrlResolver = require('angular2/src/core/compiler/style_url_resolver').StyleUrlResolver;
var MockTemplateResolver = require('angular2/src/mock/template_resolver_mock.js').MockTemplateResolver;

// var ngDom = require('angular2/src/dom/dom_adapter');

var Parse5DomAdapter = require('angular2/src/dom/parse5_adapter').Parse5DomAdapter;
Parse5DomAdapter.makeCurrent();
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
  new ng2.DirectiveMetadataReader(),
  new ng2.Parser(new ng2.Lexer()),
  new ng2.CompilerCache(),
  new ng2.NativeShadowDomStrategy(styleUrlResolver),
  tplResolver,
  new ng2.ComponentUrlMapper(),
  urlResolver,
  new CssProcessor(null)
);

function createView(pv) {
  component = new ng2.TestComponent();
  view = pv.instantiate(null, null);
  view.hydrate(new ng2.Injector([]), null, component);
  cd = view.changeDetector;
}

function compileWithTemplate(component, directives, html) {
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
  app.engine('ng2.html', function (filePath, options, callback) { // define the template engine
    fs.readFile(filePath, function (err, content) {

      if (err) return callback(new Error(err));
      // this is an extremely simple template engine
      var rendered = content.toString().
      replace('Loading...',
        '<app>'+
        'Loading Swag'+
        '</app>'+
        '\n'+
        '<pre>'+
          JSON.stringify(options, null, 2)+
        '</pre>'
      );

      return callback(null, rendered);
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
