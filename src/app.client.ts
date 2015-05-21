/// <reference path="../typings/angular2/angular2.d.ts" />

import {bootstrap, bind} from 'angular2/angular2';
import {OpaqueToken} from 'angular2/di';
import {App} from './app/app';

import {
  ShadowDomStrategy,
  NativeShadowDomStrategy
} from 'angular2/core';

export var IS_SERVER_TOKEN = new OpaqueToken('Server');

bootstrap(App, [
  bind(ShadowDomStrategy).toClass(NativeShadowDomStrategy),
  bind(IS_SERVER_TOKEN).toValue(true)
])
.then(appRef => {
  console.log('client', appRef);
  // debugger;
  return appRef;
});

export {App}
