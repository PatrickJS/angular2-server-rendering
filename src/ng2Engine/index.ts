import {readFile} from 'fs';

// server version
import {bootstrap} from '../angular2_server';
//

import {escapeRegExp, showDebug} from './helper';
import {ng2string} from './ng2string';

import {DOCUMENT_TOKEN, bind} from 'angular2/angular2';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';

// because state is evil
var AppRef = null;
var FakeDoc = null;

var directiveResolver = new DirectiveResolver();

export function ng2Engine(filePath: string, {App}, done) {
  function readNgTemplate(err, content) {
    if (err) { return done(new Error(err)); }
    try {

      if (!FakeDoc) {
        FakeDoc = DOM.createHtmlDocument();
        // app hard coded
        let annotations = directiveResolver.resolve(App);
        let el = DOM.createElement(annotations.selector, FakeDoc);
        DOM.appendChild(FakeDoc.body, el);
      }

      Promise.resolve(
        AppRef || bootstrap(App, [
          bind(DOCUMENT_TOKEN).toValue(FakeDoc)
        ])
      )
      .then(function(appRef) {
        if (!AppRef) { AppRef = appRef; }
        return AppRef;
      })
      .then(function(appRef) {

        var el = appRef._hostComponent.location.domElement;
        var serializedCmp = ng2string(el);
        var selector = el.name;

        // console.log('appRef', '\n', '\n', serializedCmp);
        // debugger;

        // var debugInfo = showDebug(App, appRef);

        // <app></app>
        var intro =  '<' + selector + '>';
        var outro = '</' + selector + '>';
        var appCmp = intro + outro;
        var regExpSelector = new RegExp(escapeRegExp(appCmp), 'g');
        var rendered = content.toString().replace(regExpSelector, serializedCmp/* + debugInfo*/)
        // debugger;

        done(null, rendered);
      })
      .catch(err => {
        debugger;
        done(err)
      });

    } catch (e) {
      done(e);
    }
  }
  // read file on disk
  readFile(filePath, readNgTemplate);
};
