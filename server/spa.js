var express = require('express');
var historyApiFallback = require('connect-history-api-fallback');


module.exports = function(ROOT) {
  // Our Top Level App Component
  var App = require(ROOT+'/dist/app/app').App;

  var router = express.Router();

  router.route('/')
    .get(function ngApp(req, res) {
      res.render('index', {
        clientOnly: false,
        Component: App,
        req: req,
        res: res
      });
    });

  router.use(historyApiFallback({
    // verbose: true
  }));


  return router;
}
