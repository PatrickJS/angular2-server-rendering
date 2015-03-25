import express from 'express';               // express to serve up files
import serveStatic from 'serve-static';      // static server for dist files
import morgan  from 'morgan';                // http request logger middleware
import path from 'path';                     // path normalization

import ng2Engine from '../../dev_modules/angular2_engine';

// es6
import {TodoApp, Store, TodoFactory} from '../../dist/server/app.es6.js';

export function App(ROOT) {
  var app = express();
  var router = express.Router();

  //app.use(morgan('combined'));
  app.use(morgan('dev'));
  app.engine('ng2.html', ng2Engine);
  app.set('views', path.join(ROOT, 'src'));       // specify the views directory
  app.set('view engine', 'ng2.html');             // register the template engine
  app.set('view options', { doctype: 'html' });   // set the doctype


  router.route('/')                               // routing for home page
    .get(function(req, res) {


      res.render('index', {
        Component: TodoApp,
        selector: 'todo-app',
        arguments: [
          new Store(),
          new TodoFactory()
        ]
      });
    });

  app.use(router);
  app.use(serveStatic(ROOT + '/dist'));           // statically serve up js files
  app.use(serveStatic(ROOT + '/dist/client'));           // statically serve up js files
  app.use(serveStatic(ROOT + '/public'));         // statically serve up js files

  return app;
};
