var express = require('express');
var serveStatic = require('serve-static');

module.exports = function(ROOT) {
  var router = express.Router();

  router.use(function(req, res, next) {
    serveStatic(ROOT + '/web_modules', {
      maxAge: '0',
      setHeaders: setCustomCacheControl
    })(req, res, next);
  });

  function setCustomCacheControl(res, path) {
    var testPreboot = /preboot/;
    console.log('path', path);
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    if (testPreboot.test(path)) {
      // Custom Cache-Control for HTML files
      res.setHeader('Cache-Control', 'public, max-age=10800')
    }
    if (/angular2/.test(path)) {
      // Custom Cache-Control for HTML files
      res.setHeader('Cache-Control', 'public, max-age=10800')
    }
    if (express.static.mime.lookup(path) === 'text/html') {
      // Custom Cache-Control for HTML files
      res.setHeader('Cache-Control', 'public, max-age=0')
    }
  }

  return router;
}
