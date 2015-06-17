var express = require('express');
var historyApiFallback = require('connect-history-api-fallback');

module.exports = function(ROOT) {
  var router = express.Router();


  router.route('/')
    .get(function ngApp(req, res) {
      res.render('index', {
        clientOnly: false,
        Component: require(ROOT+'/dist/app/app').App,
        Params: {
          url: req.url,
          originalUrl: req.originalUrl,
          path: req.path,
          params: req.params,
          query: req.query,
          cookie: req.cookies,
          signedCookies: req.signedCookies
        }
      });
    });
  router.use(historyApiFallback({
    // verbose: true
  }));


  return router;
}
