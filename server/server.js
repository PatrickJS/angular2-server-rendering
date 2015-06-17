'use strict';
var express = require('express');
var serveStatic = require('serve-static');
var morgan = require('morgan');
var path = require('path');

module.exports = function(ROOT) {
  var app = express();

  var ng2Engine = require(ROOT+'/dist/ng2Engine').ng2Engine;
  // rendering engine

  app.engine('ng2.html', ng2Engine);
  app.set('views', path.join(ROOT, 'src'));
  app.set('view engine', 'ng2.html');
  app.set('view options', { doctype: 'html' });

  app.use(serveStatic(ROOT + '/dist'));
  app.use(serveStatic(ROOT + '/public'));

  var angular2_dist = require('./routes/angular2_dist')(ROOT);
  var web_modules = require('./routes/web_modules')(ROOT);
  var dev_source_maps = require('./routes/dev_source_maps')(ROOT);
  var examples = require('./routes/examples')(ROOT);

  var spa = require('./spa')(ROOT);
  var api = require('./api')(ROOT);

  app.use('/angular2/dist', angular2_dist);
  app.use('/lib', web_modules);
  app.use(dev_source_maps);
  app.use(spa);
  app.use('/api', api);
  app.use('/angular2_examples', examples);



  app.use(morgan('dev'));
  app.get('*', function(req, res) {
    res.json({
      'route': 'Sorry this page does not exist!'
    });
  });

  return app;
};
