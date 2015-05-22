/// <reference path="../typings/angular2/angular2.d.ts" />

import {bind} from 'angular2/angular2';
import {bootstrap} from './angular2_client/bootstrap.client';
import {OpaqueToken} from 'angular2/di';
import {SERVER_RENDERED_TOKEN} from './angular2_client/dom_renderer';
import {App} from './app/app';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/core';

bootstrap(App, [
  bind(ShadowDomStrategy).toClass(NativeShadowDomStrategy),
  bind(SERVER_RENDERED_TOKEN).toValue(true)
])
.then(appRef => {
  console.log('client', appRef);
  // debugger;
  return appRef;
});

export {App}
