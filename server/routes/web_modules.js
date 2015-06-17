var express = require('express');
var serveStatic = require('serve-static');

module.exports = function(ROOT) {
  var router = express.Router();

  router.use(function(req, res, next) {
    serveStatic(ROOT + '/web_modules')(req, res, next);
  });

  return router;
}
