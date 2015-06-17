var express = require('express');


module.exports = function() {
  var router = express.Router();


  router.get(function ngApp(req, res) {
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


  return router;
}
