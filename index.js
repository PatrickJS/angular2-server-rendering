var port = process.env.PORT    || 3000;
// var ssl  = process.env.SSLPORT || 4000;

// Module dependencies
var http = require('http');
// var https = require('https');

/*
var options = {
  key:  fs.readFileSync('/private/etc/apache2/ssl/ssl.key'),
  cert: fs.readFileSync('/private/etc/apache2/ssl/ssl.crt')
};
*/
var traceur = require('gulp-traceur/node_modules/traceur/bin/traceur-runtime.js');
var app_server = require('./dist/server/app_server.es6.js');
var server = app_server.App(__dirname);

// Start server
http.createServer(server).listen(port, function() {
  console.log('Listening on port: ' + port);
});
/*
https.createServer(options, server).listen(ssl, function() {
  console.log('Listening on port: ' + ssl + ' in ' + process.env.NODE_ENV);
});
*/
