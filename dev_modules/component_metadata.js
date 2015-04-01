// var fs = require('fs'); // read in template file
var util = require('util'); // used to do JSON.stringify() like thing
var Promise = require('bluebird');
var _ = require('lodash');
var fs = Promise.promisifyAll(require('fs'));


console.time('Loading Angular'); // 300ms
// Parse5DomAdapter needs to be before angular2
// this will set the Parse5DomAdapter as the DOM in dom_adapter
// essentially I believe this is our mock DOM perhaps?
var Parse5DomAdapter = require('angular2/src/dom/parse5_adapter').Parse5DomAdapter;
Parse5DomAdapter.makeCurrent();

// get Angular2 libraries that we will use
var ng2 = require('angular2/angular2');             // main lib used when creating compiler
var di = require('angular2/di');                    // only used for view.hydrate(new di.Injector([]), null, component)
var ngDirectives = require('angular2/directives');  // when we compile, we need to make sure core directives available

// this is passed into the StyleUrlResolver
var UrlResolver = require('angular2/src/core/compiler/url_resolver').UrlResolver;

// this used to create EmulatedUnscopedShadowDomStrategy(styleUrlResolver); used to resolve URLs for styles?
var StyleUrlResolver = require('angular2/src/core/compiler/style_url_resolver').StyleUrlResolver;
// var StyleInliner = require('angular2/src/core/compiler/style_inliner').StyleInliner

// passed into compiler, but not sure what it does; something with emulating the DOM
var shadow_dom_strategy = require('angular2/src/core/compiler/shadow_dom_strategy');
var EmulatedUnscopedShadowDomStrategy = shadow_dom_strategy.EmulatedUnscopedShadowDomStrategy;

// doesn't seem like these are used so commenting it out
//var NativeShadowDomStrategy = shadow_dom_strategy.NativeShadowDomStrategy;
// var EmulatedScopedShadowDomStrategy = shadow_dom_strategy.EmulatedScopedShadowDomStrategy;

// I think used to add styles to web component...how does this work on the server side?
var CssProcessor = require('angular2/src/core/compiler/css_processor').CssProcessor;


// I was not able to see this being used anywhere so commenting it out
var TemplateResolver = require('angular2/src/core/compiler/template_resolver').TemplateResolver;

// allows us to set the template
// var MockTemplateResolver = require('angular2/src/mock/template_resolver_mock.js').MockTemplateResolver;

// read the annotations from a component
var DirectiveMetadataReader = require('angular2/src/core/compiler/directive_metadata_reader').DirectiveMetadataReader;

// setting URL for a given component
var ComponentUrlMapper = require('angular2/src/core/compiler/component_url_mapper').ComponentUrlMapper;

// referencing the DOM...but this is actually the Parse5DomAdapter that was set earlier
var DOM = require('angular2/src/dom/dom_adapter').DOM;

//var ngCore = require('angular2/core');
//console.log('angular2', ng2, '\n', ngDirectives, '\n', ngCore, '\nparse\n');

/*
console.time('Loading Compiler');
var urlResolver = new UrlResolver();
var tplResolver = new MockTemplateResolver();
var styleUrlResolver = new StyleUrlResolver(urlResolver);
// var styleInliner = new StyleInliner();
var host = DOM.createElement('div');
// create the compiler
var compiler = new ng2.Compiler(
  ng2.dynamicChangeDetection,
  new ng2.TemplateLoader(null, null),
  new DirectiveMetadataReader(),
  new ng2.Parser(new ng2.Lexer()),
  new ng2.CompilerCache(),
  new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, host),
  tplResolver,
  new ComponentUrlMapper(),
  urlResolver,
  new CssProcessor(null)
);
console.timeEnd('Loading Compiler');
*/
console.timeEnd('Loading Angular');
// HTML parser (not used right now)
//var parse5 = require('parse5');
//var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
//var serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
//var treeAdapter = parser.treeAdapter;

// var temp = treeAdapter.createElement("template", null, []);
// treeAdapter.appendChild(temp, view.nodes[0]);
// var serialized = serializer.serialize(temp);
// var newParser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
// return newParser.parseFragment(serialized).childNodes[0];

var ng2string = require('./ng2string');


function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function copyCmp(context) {
  var state = {};
  for (var prop in context) {
    state[prop] = context[prop];
  }
  return state;
}

function yoloCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

function wrapper(f, args) {
  return function() {
    f.apply(this, args);
  };
}

function showDebug(options, state) {
  return '\n'+
  '<pre>'+
  'Server = ' + JSON.stringify(options, null, 2)+
  '</pre>'+
  '<pre>'+
  '// Component State'+
  'state = ' + JSON.stringify(state, null, 2)+
  '</pre>';
}

/**
 * This is the actual template engine where all the magic happens
 * @param filePath
 * @param options
 * @param done
 */
module.exports = function ng2Engine(filePath, options, done) {


  // read in the server side template file
  //TODO: need to implement routing so we can use that instead of express router (express router simple * to angular router)
  //TODO: HOWEVER, we do have to account for the fact that the main page wrapper is server side only

  console.time('Read File'); // 2ms
  fs.readFileAsync(filePath)
  .then(function(content) {
    console.timeEnd('Read File');


    var Component = options.Component;

    console.time('Loading Compiler'); // 2ms
    var urlResolver = new UrlResolver();
    // var tplResolver = new MockTemplateResolver();
    var styleUrlResolver = new StyleUrlResolver(urlResolver);
    // var styleInliner = new StyleInliner();
    var hostElement = DOM.createElement(options.selector);
    // create the compiler
    var compiler = new ng2.Compiler(
      ng2.dynamicChangeDetection,
      new ng2.TemplateLoader(null, null),
      new DirectiveMetadataReader(),
      new ng2.Parser(new ng2.Lexer()),
      new ng2.CompilerCache(),
      new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, hostElement),
      // tplResolver,
      new TemplateResolver(),
      new ComponentUrlMapper(),
      urlResolver,
      new CssProcessor(null)
    );
    console.timeEnd('Loading Compiler');

    if (Component && Component.annotations) {
      var canHasRender = false;
      for (var i = 0; i < Component.annotations.length; i++) {
        if (Component.annotations[i].server) {
          canHasRender = true;
          break;
        }
      };
      if (!canHasRender) {
        return done(null, content.toString());
      }
    }

    console.time('Compiling Template');

    Promise.props({
      TodoApp: compiler.compile(Component)
      // ComposeTestClient: compiler.compile(options.ngApp.ComposeTestClient),
      // ComposeTestServer: compiler.compile(options.ngApp.ComposeTestServer)
    })
    // .then(function(protoViews) {
    //   // components

    // })
    .then(function(protoViews) {

    // 60-80ms
    // compiler.compile(Component)
      console.timeEnd('Compiling Template');
      console.time('Hydrate Template'); // 30ms
      //console.log('before createView(pv)', pv);

      //************ CREATING THE VIEW ***************
      console.time('Instantiate Component'); // 11-20ms
      var component = new (
        wrapper(Component, options.arguments)
      );
      var view = protoViews.TodoApp.instantiate(null, null);
      console.timeEnd('Instantiate Component');

      console.time('Hydrate Component'); // 1ms
      view.hydrate(new di.Injector([]), null, null, component, null);
      console.timeEnd('Hydrate Component');

      //TODO: why do we need to detect changes when we should be doing it in one shot?
      var cd = view.changeDetector;
      cd.detectChanges();

      console.time('Serialize Component'); // 1-2ms
      var copyHostElement = DOM.clone(hostElement);
      // console.log('hostElement', copyHostElement);
      var len = copyHostElement.children.length;
      for (var i = 0; i < view.nodes.length; i++) {
        copyHostElement.children[len+i] = view.nodes[i];
      };
      // console.log('hostElement', copyHostElement);
      var serializedCmp = ng2string(copyHostElement);
      // var serializedHost = ng2string(hostElement);
      console.timeEnd('Serialize Component');
      // debugger;

      console.log('The file was saved!');




      var indexComponent = 0;
      var indexTemplate = 1;
      var indexService = 0;

      var outputAppFilename = '/tmp/app.json';
      var outputFilename = '/tmp/' + Component.annotations[indexComponent].selector + '.json';
      function createFileName(filename) {
        return '/tmp/' + filename + '.json';
      }

      var services = '/tmp/' + Component.annotations[indexComponent].services;

      var directivesList = Component.annotations[indexTemplate].directives;
      // direct


      function IsJSON(value) {
        this.value = value;
        return this;
      }

      function toJsonReplacer(key, value) {
        var val = value;

        if (value && value.name) {
          if (value instanceof IsJSON) {
            return val;
          }

          // directives
          if (value.name in ngDirectives) {
            // return value.name;
            return {
              type: value.name,
              options: {}
            };
          } else if (value.name in options.ngApp.directives) {
            // return value.name;
            return {
              type: value.name,
              options: {}
            };
          }

          // services
          if (value.name in options.ngApp.services) {
            // return value.name;
            return {
              type: value.name,
              options: {}
            };
          }

        }
        return val;
      }

      // function fromJsonReplacer(key, value) {
      //   var val = value;
      //   if (value && value.name) {
      //     if (value instanceof IsJSON) {
      //       return val;
      //     }

      //     // directives
      //     if (value.name in ngDirectives) {
      //       return value.name;
      //     } else if (value.name in options.ngApp.directives) {
      //       return value.name;
      //     }

      //     // services
      //     if (value.name in options.ngApp.services) {
      //       return value.name;
      //     }

      //   }

      //   return val;
      // }

      // var temp = JSON.parse(serializedCmp, fromJsonReplacer)

      // var listDirectives = [
      //   options.ngApp.directives.TodoApp,
      //   options.ngApp.directives.ComposeTestClient,
      //   options.ngApp.directives.ComposeTestServer
      // ];


      // var AppAnno = yoloCopy(options.ngApp.TodoApp.annotations);

      // AppAnno[indexComponent].services = [
      //   0,
      //   1
      // ];
      // AppAnno[indexTemplate].directives = [
      //   1, // For
      //   3, // ComposeTestClient
      //   4 // ComposeTestServer
      // ];

          // options.ngApp.TodoApp.annotations,
          // options.ngApp.ComposeTestClient.annotations,
          // options.ngApp.ComposeTestServer.annotations,
      var appJSON = {
        annotations: options.Component.annotations,
        services: [
          options.ngApp.services.TodoStore,
          options.ngApp.services.TodoFactory
        ],
        templates: [
          serializedCmp,
        ],
        directives: [
          ngDirectives.If,
          ngDirectives.For,
          options.ngApp.directives.TodoApp,
          options.ngApp.directives.ComposeTestClient,
          options.ngApp.directives.ComposeTestServer
        ]
      };
      console.log('wattt', appJSON)

      // var tla = createComponentAsync(AppAnno, appJSON);


      // create File json
      function writeComponentAsync(currentComp, pathMap) {
        // should check if instanceof
        var Comp = currentComp[0]
        var Temp = currentComp[1]
        var Env = currentComp[2]

        function hasDeps(type) {
          return function(val, index) {
            if (pathMap && pathMap[type]) {
              return true;
              // console.log('WDSDSSDDS', val);
              // if (_.isArray(deps[type])) {
              //   var index = _.indexOf(deps[val], val);
              //   return (index !== -1) ? true : false;
              // }
            }
            return false;
          }
        }

        var componentJSONtostring = {
          name: Comp.selector,
          // annotations: currentComp,
          services: _(Comp.services).
            filter(hasDeps('services')).
            map(function(val) {
              return pathMap[val.name] || val.name;
            }).
            value(),
          directives: _(Temp.directives).
            filter(hasDeps('directives')).
            map(function(val) {
              return pathMap[val.name] || val.name;
            }).
            value()
        };

        return componentJSONtostring;
      }

      function createComponentAsync(annotations, deps) {
        var cmp = writeComponentAsync(annotations, deps);

        var annotate = _.map(annotations, function(anno) {
          return _.mapValues(anno, function(value, key) {
            // return index of deps otherwise return value
            if (key in cmp) {
              if (_.isArray(value) && value.length) {
                return _.map(value, function(yo, i) {
                  // check if function name
                  var index = _.indexOf(cmp[key], yo.name || yo);
                  return (index !== -1) ? index : null;
                });
              }
            }
            return value;
          });

        });

        cmp.annotations = annotate;

        return cmp
      }


      // mutation global appJSON
      _.each(options.ngApp.components, function(cmp, key) {
        if (cmp && cmp.annotations) {
          var obj = createComponentAsync(cmp.annotations, appJSON);

          // obj.name = cmp.name;

          console.log('cmp', cmp.name)
          fs.writeFileAsync(createFileName(
            cmp.name
          ), JSON.stringify(obj, toJsonReplacer, 2), 'utf-8');
        }
      });

      var serializedObject = JSON.stringify(appJSON, toJsonReplacer, 2);
      fs.writeFileAsync(outputAppFilename, serializedObject, 'utf-8');

      console.log('wattt', serializedObject)


      console.time('Inject Component'); // 0-2ms

      // you can has debugger with node-inspector
      // debugger;

      // <app></app>
      var intro =  '<' + options.selector + '>';
      var outro = '</' + options.selector + '>';

      var selector = intro + outro;

      var regExpSelector = new RegExp(escapeRegExp(selector), 'g');

      var injectContent = serializedCmp;


      // debug info
      // var state = copyCmp(view.context);
      // var debugInfo = showDebug(options, state);

      var rendered = content.toString().replace(regExpSelector, serializedCmp /*+ debugInfo*/);
      console.timeEnd('Inject Component');

      console.timeEnd('Hydrate Template');
      return rendered;
    })
    .then(function(rendered) {
      done(null, rendered);
    })
    .catch(function(err) {
      done(err);
    });
  })
  .catch(function(err) {
    // if error while reading file, then throw error
    done(new Error(err));
  })

};
