/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../typings/_custom/ng2.d.ts" />
/// <reference path="../../typings/_custom/server.d.ts" />

import {Component, View, coreDirectives} from 'angular2/angular2';


@Component({
  selector: 'app'
})
@View({
  directives: [ coreDirectives ],
  template: `
  <h1>Hello Server Renderer</h1>
  <h3>test binding {{ wat }}</h3>
  <span>{{ wat }}</span>
  {{ wat }}

  <div>
    <pre>// App.testing()
{{ testing() | json }}</pre>
    <pre>// App.clickingTest()
{{ buttonTest | json }}</pre>
  </div>
  <div>
    <input type="text" autofocus [value]="wat" (keyup)="log(wat)">
    {{ wat }}
  </div>
  <div>
    <button (click)="clickingTest()">Click Test</button>
  </div>

  <div *ng-if="toggle">
    NgIf true
  </div>

  <div>
    <button (click)="toggleNgIf()">Toggle NgIf</button>
  </div>
  <ul>
    <li *ng-for="var item of items">
      {{ item }}
    </li>
  </ul>

  <div>
    <button (click)="addItem()">Add Item</button>
    <button (click)="removeItem()">Remove Item</button>
  </div>



  <p>
    Problem with default component state and stateful DOM
    <br>
    <input #testInput [value]="testingInput" (change)="log($event)">
    {{ testingInput }}
  </p>


  `
})
export class App {
  wat: string;
  buttonTest: string;
  testingInput: string;
  itemCount: number;
  items: string[];
  toggle: boolean;
  constructor() {
    this.wat = 'wat'+5;
    this.buttonTest = '';
    this.testingInput = 'default state on component';
    this.itemCount = 0;
    this.items = [];
    this.toggle = true;

    this.addItem();
    this.addItem();
    this.addItem();
  }
  log(val) {
    console.log(val);
  }
  toggleNgIf() {
    this.toggle = !this.toggle;
  }
  testing() {
    return 'testing'+5;
  }
  clickingTest() {
    this.buttonTest = 'click' + this.testing() + (~~(Math.random()*20));
    console.log(this.buttonTest);
  }
  addItem() {
    this.items.push('item ' + this.itemCount++);
  }
  removeItem() {
    this.items.pop()
  }
}
