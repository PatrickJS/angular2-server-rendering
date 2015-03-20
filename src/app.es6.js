import {Component, Template} from 'angular2/angular2';
import {If, Foreach} from 'angular2/directives';
import {bootstrap} from 'angular2/angular2';


function dedent(strings, ...values) {
  var result = '';
  for (var i = 0; i < strings.length; i++) {
    result += (strings[i]) ?
      strings[i].replace(/\n\s+/g, '\n') +
      (
        values[i] ? values[i] : ''
      )
    : '';
  }
  return result;
}


@Component({
  selector: 'app'
})
@Template({
  inline: `
<div>
  <span>
    Hello, {{ username }}!
  </span>
  <span *if="username">
    Nice to meet you
  </span>
  <ul>
    <li *foreach="var item in items; var i = index">
      {{ i }} {{ item.content }}
    </li>
  </ul>
</div>
`,
  directives: [
    If,
    Foreach
  ]
})
export class App {
  constructor() {
    this.username = 'World';
    this.items = [
      {
        content: 'testing1'
      },
      {
        content: 'testing2'
      }
    ];
    setTimeout(() => {
      this.username = 'NEW World'
    }, 2000);
  }
  swag() {
    console.log('swag')
  }
}
