import * as fs from 'fs';

// server version
import {bootstrap} from '../angular2_server';
//

import {
  getHostElementRef,
  selectorRegExpFactory
} from './helper';
import {ng2string} from './ng2string';

import {DOCUMENT_TOKEN, bind} from 'angular2/angular2';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';

// because state is evil
var AppRef = null;
var FakeDoc = null;

var directiveResolver = new DirectiveResolver();

export function readNgTemplate(content, AppComponent) {
  let annotations = directiveResolver.resolve(AppComponent);

  if (!FakeDoc) {
    FakeDoc = DOM.createHtmlDocument();
    let el = DOM.createElement(annotations.selector, FakeDoc);
    DOM.appendChild(FakeDoc.body, el);
  }

  return Promise.resolve(
    AppRef || bootstrap(AppComponent, [
      bind(DOCUMENT_TOKEN).toValue(FakeDoc)
    ])
  )
  .then(appRef => AppRef ? AppRef : AppRef = appRef)
  .then(appRef => {

    let serializedCmp = ng2string(getHostElementRef(appRef));
    let selector = annotations.selector;

    let rendered = content.toString().replace(
      // <app></app>
      selectorRegExpFactory(selector),
      serializedCmp/* + showDebug(Object)*/
    );

    return rendered;
  })
  .catch(err => {
    debugger;
    throw err;
  });
}

export function ng2Engine(filePath: string, options = {}, done) {
  // read file on disk
  try {
    fs.readFile(filePath, (err, content) => {
      if (err) {
        return done(new Error(err));
      }

      readNgTemplate(content, options.App)
      .then(rendered => done(null, rendered))
      .catch(e => done(e));
    });
  } catch (e) {
    done(e);
  }
};
