/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../typings/_custom/ng2.d.ts" />
/// <reference path="../typings/_custom/server.d.ts" />

import {bootstrap} from './angular2_client/bootstrap.client';
// import {bootstrap} from 'angular2/angular2';


import {bind, OpaqueToken} from 'angular2/di';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/core';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';


import {SERVER_RENDERED_TOKEN} from './angular2_client/dom_renderer';
import {App} from './app/app';



bootstrap(App, [
  // doesn't work with server rendering
  bind(ShadowDomStrategy).toFactory(
    styleUrlResolver => new NativeShadowDomStrategy(styleUrlResolver),
    [StyleUrlResolver]
  ),
  bind(SERVER_RENDERED_TOKEN).toValue(true)
])
.then(appRef => {
  console.log('client', appRef);
  // debugger;
  return appRef;
});

export {App}
