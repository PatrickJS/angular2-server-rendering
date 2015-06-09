/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../typings/_custom/ng2.d.ts" />
/// <reference path="../typings/_custom/server.d.ts" />

// import {bootstrap} from './angular2_client/bootstrap.client';
import {bootstrap} from 'angular2/angular2';


import {bind, OpaqueToken} from 'angular2/di';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/render';
import {App} from './app/app';


export function main() {
  return bootstrap(App, [
    // doesn't work with server rendering
    // bind(ShadowDomStrategy).toClass(NativeShadowDomStrategy),
    //bind(SERVER_RENDERED_TOKEN).toValue(true)
  ])
  .then(appRef => {
    console.log('client', appRef);
    // debugger;
    return appRef;
  });
}
