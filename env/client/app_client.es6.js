Promise.all([
  System.import('angular2/core'),
  System.import('angular2/di'),
  System.import('angular2/src/core/compiler/shadow_dom_strategy'),
  System.import('app.es6')
])
.then(function(modules) {
  var ng2 = modules[0];
  var di = modules[1];
  var dom = modules[2];
  var cmp = modules[3];
  return new Promise(function(resolve) {
    var bindings = [];
    if (!!document.body.createShadowRoot) {
      bindings.push(
        di.bind(dom.ShadowDomStrategy).toClass(dom.NativeShadowDomStrategy)
      );
    }
    // because angular2 bootstraps too fast
    var timer = 0;
    setTimeout(function() {
      resolve(
        ng2.bootstrap(cmp.TodoApp, bindings)
      );
    }, timer);
  });
  // return modules[0].bootstrap(modules[1].App);
})
.catch(console.log.bind(console));
