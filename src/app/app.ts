/// <reference path="../../typings/angular2/angular2.d.ts" />
/// <reference path="../../typings/_custom/ng2.d.ts" />
/// <reference path="../../typings/_custom/server.d.ts" />

import {Component, View} from 'angular2/angular2';

@Component({
  selector: 'app'
})
@View({
  template: `
  <h1>Hello Server Renderer</h1>
  <h3>test binding {{ wat }}</h3>
  <span>{{ wat }}</span>
  {{ wat }}
  `
})
export class App {
  wat: string;
  constructor() {
    this.wat = 'wat'+(~~(Math.random()*20));
  }
}
