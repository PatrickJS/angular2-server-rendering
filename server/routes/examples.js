var express = require('express');


module.exports = function(ROOT) {
  var router = express.Router();

  // Example repos
  router.route('/hello_world')
  .get(function(req, res) {
    var HelloCmp = require(ROOT+'/dist/angular2_examples/hello_world/index_common').HelloCmp;

    res.render('angular2_examples/hello_world/index', {
      Component: HelloCmp
    });
  });

  router.route('/key_events')
  .get(function(req, res) {
    var KeyEventsApp = require(ROOT+'/dist/angular2_examples/key_events').KeyEventsApp;

    res.render('angular2_examples/key_events/index', {
      Component: KeyEventsApp
    });
  });

  router.route('/forms')
  .get(function(req, res) {
    var SurveyBuilder = require(ROOT+'/dist/angular2_examples/forms').SurveyBuilder;

    res.render('angular2_examples/forms/index', {
      Component: SurveyBuilder
    });
  });

  router.route('/todo')
  .get(function(req, res) {
    var TodoApp = require(ROOT+'/dist/angular2_examples/todo').TodoApp;
    res.render('angular2_examples/todo/index', {
      // clientOnly: true,
      Component: TodoApp
    });
  });
  router.route('/largetable')
  .get(function(req, res) {

    var AppComponent = require(ROOT+'/dist/angular2_examples/largetable/largetable').AppComponent;
    res.render('angular2_examples/largetable/index', {
      clientOnly: true,
      Component: AppComponent
    });
  });

  return router;
}
