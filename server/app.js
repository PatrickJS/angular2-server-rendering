var express = require('express');
var serveStatic = require('serve-static');
var morgan  = require('morgan');
var fs = require('fs');
var router = require('express').Router();
var path = require('path');
// var jsdom = require("jsdom");

var cmp = require('../dist/app.node.es6.js');


function TemplateEngine(html, options) {
  var re = /\{\{([^\}\}]+)?\}\}/g;
  var reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g;
  var code = 'with(cmp) { var r=[];\n';
  var cursor = 0;
  var match;
  var result = '';

  function add(line, js) {
    js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
        (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
    return add;
  }

  while((match = re.exec(html), match)) {
    add(html.slice(cursor, match.index))(match[1], true);
    cursor = match.index + match[0].length;
  }

  add(html.substr(cursor, html.length - cursor));
  code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, '');

  try {
    result = new Function('cmp', code).apply(options, [options]);
  } catch(err) {
    console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
  }
  return result;
}

var tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

function replaceTag(tag) {
  return tagsToReplace[tag] || tag;
}

function safeHtml(str) {
  return str.replace(/[&<>]/g, replaceTag);
}

function prettyPrint(code) {
  return JSON.stringify(code, null, 2);
}

module.exports = function(ROOT) { // jshint ignore:line
  var app = express();

  if (process.env.NODE_ENV !== 'development') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }
  // console.log('angular2', ng2);
  // console.log('di', di);
  app.engine('ng2.html', function (filePath, options, callback) { // define the template engine
    fs.readFile(filePath, function (err, content) {
      if (err) return callback(new Error(err));

      var cmpApp = new cmp.App();
      var tmp = TemplateEngine(cmp.template, cmpApp);


      // this is an extremely simple template engine
      var rendered = content.toString().
      replace('__ServerRendered__',
        '<app>'+
        // 'Loading Swag'+
        tmp+
        '</app>'+

        '\n'+
        '<pre>'+
          '// App Component\n'+
          cmpApp.name + ' = '+
          prettyPrint(cmpApp)+
        '</pre>'+
        '<pre>'+
          'Server = '+
          prettyPrint(options)+
        '</pre>'+
        '<code>'+
        safeHtml(tmp)+
        '</code>'

      );
      setTimeout(function() {
        callback(null, rendered);
      }, 0);

      return ;
    });
  });


  app.set('views', path.join(ROOT, 'src')); // specify the views directory
  app.set('view engine', 'ng2.html'); // register the template engine
  app.set('view options', { doctype: 'html' });


  router.route('/')
  .get(function(req, res) {
    res.render('index', {yolo: 'yolo'});
  });

  app.use(router);


  app.use(serveStatic(ROOT + '/dist'));


  return app;
};
