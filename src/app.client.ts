/// <reference path="../typings/angular2/angular2.d.ts" />

import {bootstrap} from './bootstrap.client';
import {App} from './app/app';

import {bind} from 'angular2/di';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {NativeShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy';

bootstrap(App, [
  bind(ShadowDomStrategy).toClass(NativeShadowDomStrategy)
])
.then(cmpRef => {
  console.log('client', cmpRef);
  // debugger;
  return cmpRef;
});

export {App}
