import {Component, Template} from 'angular2/angular2';
import {If} from 'angular2/directives';
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
    console.log('result '+i, result);
  }
  return result;
}


export var template = `
  <span *if="name">
    Hello, {{ name }}!
  </span>
`;

@Component({
  selector: 'app'
})
@Template({
  inline: template,
  directives: [
    If
  ]
})
export class App {
  constructor() {
    this.name = 'World';
    setTimeout(() => {
      this.name = 'NEW World'
    }, 2000);
  }
  swag() {
    console.log('swag')
  }
}
