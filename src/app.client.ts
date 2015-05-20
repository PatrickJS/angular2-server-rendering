/// <reference path="../typings/angular2/angular2.d.ts" />

import {bootstrap, bind} from 'angular2/angular2';
import {App} from './app/app';

import {
  ShadowDomStrategy,
  NativeShadowDomStrategy
} from 'angular2/core';

bootstrap(App, [
  bind(ShadowDomStrategy).toClass(NativeShadowDomStrategy)
])
.then(appRef => {
  console.log('client', appRef);
  // debugger;
  return appRef;
});

export {App}
