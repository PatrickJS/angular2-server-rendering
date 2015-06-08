'use strict';
var express = require('express');
var serveStatic = require('serve-static');
var morgan = require('morgan');
var path = require('path');


module.exports = function(ROOT) {
  var app = express();
  var router = express.Router();

  var iso = require(ROOT+'/dist/ng2Engine');
  // rendering engine

  app.use(morgan('dev'));
  app.engine('ng2.html', iso.ng2Engine);
  app.set('views', path.join(ROOT, 'src'));
  app.set('view engine', 'ng2.html');
  app.set('view options', { doctype: 'html' });

  function ngApp(req, res) {
    res.render('index', {
      clientOnly: true,
      Params: {
        url: req.url,
        originalUrl: req.originalUrl,
        path: req.path,
        params: req.params,
        query: req.query,
        cookie: req.cookies,
        signedCookies: req.signedCookies
      },
      Component: require(ROOT+'/dist/app/app').App
    });
  }

  router.route('/').get(ngApp);
  app.use(router);

  app.use(serveStatic(ROOT + '/dist'));
  app.use(serveStatic(ROOT + '/public'));

  app.use('/lib', function(req, res, next) {
    serveStatic(ROOT + '/web_modules')(req, res, next);
  });

  // dev source maps
  app.use('/src', function(req, res, next) {
    serveStatic(ROOT + '/src')(req, res, next);
  });
  app.use('/node_modules', function(req, res, next) {
    serveStatic(ROOT + '/node_modules')(req, res, next);
  });
  // app.use('/node_modules/angular2', function(req, res) {
  //   serveStatic(ROOT + '/dev_modules/node_modules/angular2')(req, res);
  // });
  app.use('/angular2/dist', function(req, res, next) {
    serveStatic(ROOT + '/angular/dist/bundle')(req, res, next);
  });
  // Example repos
  app.use('/angular2_examples/hello_world', function(req, res) {
    var HelloCmp = require(ROOT+'/dist/angular2_examples/hello_world/index_common').HelloCmp;

    res.render('angular2_examples/hello_world/index', {
      Component: HelloCmp
    });
  });
  app.use('/angular2_examples/key_events', function(req, res) {
    var KeyEventsApp = require(ROOT+'/dist/angular2_examples/key_events').KeyEventsApp;

    res.render('angular2_examples/key_events/index', {
      Component: KeyEventsApp
    });
  });
  app.use('/angular2_examples/forms', function(req, res) {
    var SurveyBuilder = require(ROOT+'/dist/angular2_examples/forms').SurveyBuilder;

    res.render('angular2_examples/forms/index', {
      Component: SurveyBuilder
    });
  });
  app.use('/angular2_examples/todo', function(req, res) {

    var TodoApp = require(ROOT+'/dist/angular2_examples/todo').TodoApp;
    res.render('angular2_examples/todo/index', {
      clientOnly: true,
      Component: TodoApp
    });
  });
  app.use('/angular2_examples/largetable', function(req, res) {

    var AppComponent = require(ROOT+'/dist/angular2_examples/largetable/largetable').AppComponent;
    res.render('angular2_examples/largetable/index', {
      clientOnly: true,
      Component: AppComponent
    });
  });

  app.get('*', function(req, res) {
    res.json({
      'route': 'Sorry this page does not exist!'
    });
  });

  return app;
};
