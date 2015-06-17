var express = require('express');

module.exports = function(ROOT) {
  var router = express.Router();
  router.route('/todos/:todo_id')
    .get(function(req, res) {
      res.json(null);
    })
    .post(function(req, res) {
      res.json(null);
    })
    .delete(function(req, res) {
      res.json(null);
    });

  return router;
}
