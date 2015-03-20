var express = require('express');               // express to serve up files
var serveStatic = require('serve-static');      // static server for dist files
var morgan  = require('morgan');                // http request logger middleware
var router = require('express').Router();       // express routing
var path = require('path');                     // path normalization

var ng2Engine = require('./angular2_engine');

module.exports = function(ROOT) {
  var app = express();

  //app.use(morgan('combined'));
  app.use(morgan('dev'));
  app.engine('ng2.html', ng2Engine);
  app.set('views', path.join(ROOT, 'src'));       // specify the views directory
  app.set('view engine', 'ng2.html');             // register the template engine
  app.set('view options', { doctype: 'html' });   // set the doctype

  router.route('/')                               // routing for home page
    .get(function(req, res) {
      res.render('index', {yolo: 'yolo'});
    });

  app.use(router);
  app.use(serveStatic(ROOT + '/dist'));           // statically serve up js files

  return app;
};
