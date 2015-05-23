/// <reference path="../../typings/tsd.d.ts" />
import * as fs from 'fs';

// server version
import {bootstrap} from '../angular2_server';
//

import {
  getHostElementRef,
  selectorRegExpFactory,
  showDebug
} from './helper';

import {ng2string} from './ng2string';
import {stringifyElement} from './stringifyElement';

import {DOCUMENT_TOKEN, bind} from 'angular2/angular2';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';

// because state is evil
// var AppRef = null;
var serverInjector = undefined; // because js defaults
var serverDocument = DOM.createHtmlDocument();
var serverDirectiveResolver = new DirectiveResolver();


export function readNgTemplate(content, AppComponent) {
  let annotations = serverDirectiveResolver.resolve(AppComponent);
  let selector = annotations.selector;

  let el = DOM.createElement(selector, serverDocument);
  DOM.appendChild(serverDocument.body, el);
  // }

  return Promise.resolve(
    // AppRef ||
    bootstrap(
      AppComponent,
      serverInjector,
      [
        bind(DOCUMENT_TOKEN).toValue(serverDocument),
        // bind(IS_SERVER_TOKEN).toValue(true), // defined in bootstrap
      ]
    )
  )
  // .then(appRef => AppRef ? AppRef : AppRef = appRef)
  .then(appRef => {

    // save a reference to app Injector
    if (!serverInjector && appRef.injector) {
      // console.log('\nnew Injector\n');
      serverInjector = appRef.injector;
    }
    // else {
    //   console.log('\nREUSE INJECTOR\n');
    // }

    // change detection
    appRef.changeDetection.detectChanges();

    // grab parse5 html element
    let el = appRef.hostElementRef.domElement;

    // serialize html
    let serializedCmp = stringifyElement(el);

    // selector replacer explained here
    // https://gist.github.com/gdi2290/c74afd9898d2279fef9f
    // replace our component with serialized version
    let rendered = content.toString().replace(
      // <selector></selector>
      selectorRegExpFactory(selector),
      // <selector>{{ serializedCmp }}</selector>
      serializedCmp/* + showDebug(appRef.hostComponent)*/
    );

    // destroy appComponent
    appRef.dispose();

    // remove from serverDom
    DOM.removeChild(serverDocument.body, el)

    // return rendered version of our serialized component
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

      readNgTemplate(content, options.Component)
      .then(rendered => done(null, rendered))
      .catch(e => done(e));
    });
  } catch (e) {
    done(e);
  }
};
