/// <reference path="../typings/angular2/angular2.d.ts" />

import {bootstrap} from './bootstrap.server';
import {App} from './app/app';

bootstrap(App, [

])
.then(cmpRef => {
  console.log('server', cmpRef);
  debugger;
  return cmpRef;
});

export {App};
