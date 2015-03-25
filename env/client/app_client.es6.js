Promise.all([
  System.import('angular2/core'),
  System.import('angular2/di'),
  System.import('angular2/src/core/compiler/shadow_dom_strategy'),
  System.import('app.es6')
])
.then(function([
  {bootstrap},
  {bind},
  {ShadowDomStrategy, NativeShadowDomStrategy},
  {TodoApp}
]) {
  return new Promise(function(resolve) {
    var bindings = [];
    if (!!document.body.createShadowRoot) {
      bindings.push(
        bind(ShadowDomStrategy).toClass(NativeShadowDomStrategy)
      );
    }
    // because angular2 bootstraps too fast
    var timer = 2000;
    setTimeout(function() {
      resolve(
        bootstrap(TodoApp, bindings)
      );
    }, timer);
  });
})
.catch(console.log.bind(console));
