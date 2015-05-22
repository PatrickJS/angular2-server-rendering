/// <reference path="../../typings/angular2/angular2.d.ts" />
/// <reference path="../../typings/_custom/ng2.d.ts" />
/// <reference path="../../typings/_custom/server.d.ts" />

import {Component, View} from 'angular2/angular2';

@Component({
  selector: 'app'
})
@View({
  template: `
  <h1>Hello Server Renderer {{ wat }}</h1>
  `
})
export class App {
  wat: string;
  constructor() {
    this.wat = 'wat'+(~~(Math.random()*20));
  }
}
