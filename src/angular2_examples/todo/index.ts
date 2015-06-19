import {bootstrap} from '../../angular2_client/bootstrap-defer';
// import {bootstrap} from 'angular2/angular2';

import {coreDirectives} from 'angular2/angular2';
import {Component, View, Directive} from 'angular2/angular2';
import {bind, Inject} from 'angular2/di';

import {Store, Todo, TodoFactory} from './services/TodoStore';


@Component({
  selector: 'app',
  appInjector: [ Store, TodoFactory ]
})
@View({
  directives: [ coreDirectives ],
  template: `
<section id="todoapp">

  <header id="header">
    <h1>todos</h1>
      <input
        type="text"
        id="new-todo"
        placeholder="What needs to be done?"
        autofocus
        #newtodo
        (keyup.enter)="enterTodo($event, newtodo)">
  </header>

  <section id="main">
    <input id="toggle-all" type="checkbox" (click)="toggleAll($event)">
    <label for="toggle-all">Mark all as complete</label>

    <ul id="todo-list">

      <li *ng-for="#todo of todoStore.list">

        <div class="view"
            [class.hidden]="todoEdit == todo">

          <input class="toggle" type="checkbox"
                 (click)="completeMe(todo)"
                 [checked]="todo.completed">

          <label (dblclick)="editTodo(todo)">{{ todo.title }}</label>
          <button class="destroy" (click)="deleteMe(todo)"></button>

        </div>

        <div>

          <input class="edit"
            [class.visible]="todoEdit == todo"
            [value]="todo.title"
            (keyup)="doneEditing($event, todo)">

        </div>

      </li>
    </ul>

  </section>

  <footer id="footer">
    <span id="todo-count"></span>
    <ul id="filters">
      <li>
        <a href="#/" class="selected">All</a>
      </li>
      <li>
        <a href="#/active">Active</a>
      </li>
      <li>
        <a href="#/completed">Completed</a>
      </li>
    </ul>
    <button id="clear-completed" (click)="clearCompleted()">Clear completed</button>
  </footer>

</section>

<footer id="info">
  <p>Double-click to edit a todo</p>
  <p>Created by <a href="http://twitter.com/angularjs">The Angular Team</a></p>
</footer>

  `
})
export class TodoApp {
  todoEdit: Todo = null;
  constructor(public todoStore: Store, public factory: TodoFactory) {}

  enterTodo($event, inputElement) {
    if (!inputElement.value) return;
    this.addTodo(inputElement.value);
    inputElement.value = '';
  }

  editTodo(todo: Todo) {
    this.todoEdit = todo;
  }

  doneEditing($event, todo: Todo) {
    var which = $event.which;
    var target = $event.target;

    if (which === 13) {
      todo.title = target.value;
      this.todoEdit = null;
    } else if (which === 27) {
      this.todoEdit = null;
      target.value = todo.title;
    }

  }

  addTodo(newTitle: string) {
    this.todoStore.add(this.factory.create(newTitle, false));
  }

  completeMe(todo: Todo) {
    todo.completed = !todo.completed;
  }

  deleteMe(todo: Todo) {
    this.todoStore.remove(todo);
  }

  toggleAll($event) {
    var isComplete = $event.target.checked;
    this.todoStore.list.forEach((todo: Todo) => { todo.completed = isComplete; });
  }

  clearCompleted() {
    this.todoStore.removeBy((todo) => todo.completed);
  }
}

export function main() {
  return bootstrap(TodoApp, [

  ]);
}
