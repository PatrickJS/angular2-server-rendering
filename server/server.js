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

  app.use('/lib', function(req, res) {
    serveStatic(ROOT + '/web_modules')(req, res);
  });

  // Example repos
  app.use('/angular2_examples/hello_world', function(req, res) {
    res.render('angular2_examples/hello_world/index', {
      Component: require(ROOT+'/dist/angular2_examples/hello_world/index_common').HelloCmp
    });
  });
  app.use('/angular2_examples/key_events', function(req, res) {
    res.render('angular2_examples/key_events/index', {
      Component: require(ROOT+'/dist/angular2_examples/key_events').KeyEventsApp
    });
  });
  // app.use('/angular2_examples/lib', function(req, res) {
  //   serveStatic(ROOT + '/web_modules')(req, res);
  // });

  // dev source maps
  app.use('/src', function(req, res) {
    serveStatic(ROOT + '/src')(req, res);
  });
  app.use('/node_modules', function(req, res) {
    serveStatic(ROOT + '/node_modules')(req, res);
  });
  app.use('/node_modules/angular2', function(req, res) {
    serveStatic(ROOT + '/dev_modules/node_modules/angular2')(req, res);
  });

  app.get('*', function(req, res) {
    res.json({
      'route': 'Sorry this page does not exist!'
    });
  });

  return app;
};
