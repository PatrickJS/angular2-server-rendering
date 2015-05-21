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
  let selector = annotations.selector;

  if (!FakeDoc) {
    FakeDoc = DOM.createHtmlDocument();
    let el = DOM.createElement(selector, FakeDoc);
    DOM.appendChild(FakeDoc.body, el);
  }

  return Promise.resolve(
    AppRef || bootstrap(AppComponent, [
      bind(DOCUMENT_TOKEN).toValue(FakeDoc)
    ])
  )
  .then(appRef => AppRef ? AppRef : AppRef = appRef)
  .then(appRef => {
    // selector replacer explained here
    // https://gist.github.com/gdi2290/c74afd9898d2279fef9f

    let serializedCmp = ng2string(getHostElementRef(appRef));

    let rendered = content.toString().replace(
      // <selector></selector>
      selectorRegExpFactory(selector),
      // <selector>{{ serializedCmp }}</selector>
      `$1${serializedCmp}$3`/* + showDebug(Object)*/
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
