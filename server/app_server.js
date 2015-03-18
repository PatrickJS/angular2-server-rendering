var express = require('express');               // express to serve up files
var serveStatic = require('serve-static');      // static server for dist files
var morgan  = require('morgan');                // http request logger middleware
var fs = require('fs');                         // read in template file
var router = require('express').Router();       // express routing
var path = require('path');                     // path normalization
var util = require('util');                     // used to do JSON.stringify() like thing

// Parse5DomAdapter needs to be before angular2
// this will set the Parse5DomAdapter as the DOM in dom_adapter
// essentially I believe this is our mock DOM perhaps?
var Parse5DomAdapter = require('angular2/src/dom/parse5_adapter').Parse5DomAdapter;
Parse5DomAdapter.makeCurrent();

// this is getting our custom component from /src
var cmp = require('../dist/app.node.es6.js');
var MyComponent = cmp.App;

// get Angular2 libraries that we will use
var ng2 = require('angular2/angular2');             // main lib used when creating compiler
var di = require('angular2/di');                    // only used for view.hydrate(new di.Injector([]), null, component)
var ngDirectives = require('angular2/directives');  // when we compile, we need to make sure core directives available

// this is passed into the StyleUrlResolver
var UrlResolver = require('angular2/src/core/compiler/url_resolver').UrlResolver;

// this used to create EmulatedUnscopedShadowDomStrategy(styleUrlResolver); used to resolve URLs for styles?
var StyleUrlResolver = require('angular2/src/core/compiler/style_url_resolver').StyleUrlResolver;

// passed into compiler, but not sure what it does; something with emulating the DOM
var shadow_dom_strategy = require('angular2/src/core/compiler/shadow_dom_strategy');
var EmulatedUnscopedShadowDomStrategy = shadow_dom_strategy.EmulatedUnscopedShadowDomStrategy;

// doesn't seem like these are used so commenting it out
//var NativeShadowDomStrategy = shadow_dom_strategy.NativeShadowDomStrategy;
//var EmulatedScopedShadowDomStrategy = shadow_dom_strategy.EmulatedScopedShadowDomStrategy;

// I think used to add styles to web component...how does this work on the server side?
var CssProcessor = require('angular2/src/core/compiler/css_processor').CssProcessor;

// I was not able to see this being used anywhere so commenting it out
//var TemplateResolver = require('angular2/src/core/compiler/template_resolver').TemplateResolver;

// allows us to set the template
var MockTemplateResolver = require('angular2/src/mock/template_resolver_mock.js').MockTemplateResolver;

// read the annotations from a component
var DirectiveMetadataReader = require('angular2/src/core/compiler/directive_metadata_reader').DirectiveMetadataReader;

// setting URL for a given component
var ComponentUrlMapper = require('angular2/src/core/compiler/component_url_mapper').ComponentUrlMapper;

// referencing the DOM...but this is actually the Parse5DomAdapter that was set earlier
var DOM = require('angular2/src/dom/dom_adapter').DOM;

// di.bind(ngDom.DomAdapter).toClass(Parse5DomAdapter);
// var DOM = require('angular2/src/dom/dom_adapter');
// DOM.setRootDomAdapter()
// var ComponentUrlMapper = require('angular2/src/core/compiler/component_url_mapper').ComponentUrlMapper;
// var app = new App();
// console.log('module', System);
// System('app.es6').then(function(module) {
// });

//var ngCore = require('angular2/core');
//console.log('angular2', ng2, '\n', ngDirectives, '\n', ngCore, '\nparse\n');

var urlResolver = new UrlResolver();
var tplResolver = new MockTemplateResolver();
var styleUrlResolver = new StyleUrlResolver(urlResolver);

// create the compiler
var compiler = new ng2.Compiler(
  ng2.dynamicChangeDetection,
  new ng2.TemplateLoader(null, null),
  new DirectiveMetadataReader(),
  new ng2.Parser(new ng2.Lexer()),
  new ng2.CompilerCache(),
  new EmulatedUnscopedShadowDomStrategy(styleUrlResolver),
  tplResolver,
  new ComponentUrlMapper(),
  urlResolver,
  new CssProcessor(null)
);

// HTML parser (not used right now)
//var parse5 = require('parse5');
//var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
//var serializer = new parse5.Serializer(parse5.TreeAdapters.htmlparser2);
//var treeAdapter = parser.treeAdapter;

/**
 * This is the actual template engine where all the magic happens
 * @param filePath
 * @param options
 * @param done
 */
function ng2Engine(filePath, options, done) {

    // read in the server side template file
    //TODO: need to implement routing so we can use that instead of express router (express router simple * to angular router)
    //TODO: HOWEVER, we do have to account for the fact that the main page wrapper is server side only
    fs.readFile(filePath, function (err, content) {

        // if error while reading file, then throw error
        if (err) { return done(new Error(err)); }

        // var cmpApp = new cmp.App();
        // var tmp = compiler.compile(cmp.App);
        // console.log('tmp', DOM.getText(tmp));
        //console.log('starting');

        // set the template in the resolver (which is used within the compile)
        var template = new ng2.Template({
            inline:     cmp.template,
            directives: [ngDirectives.If]
        });
        tplResolver.setTemplate(MyComponent, template);

        // compile the component and get the protoView
        compiler.compile(MyComponent).then(function(protoView) {
            //console.log('before createView(pv)', pv);

            //************ CREATING THE VIEW ***************
            //console.log('createView');
            var component = new MyComponent();
            //console.log('new component');
            var view = protoView.instantiate(null, null);
            //console.log('pv.instantiate');
            view.hydrate(new di.Injector([]), null, component);
            //console.log('view.hydrate');

            //TODO: why do we need to detect changes when we should be doing it in one shot?
            var cd = view.changeDetector;
            cd.detectChanges();

            //console.log('createView(pv)');

            for (var i = 0; i < view.nodes.length; i++) {
                //console.log('Value for ' + i + ' is ' + view.nodes[0].next.next.next.data + '\n');
                console.log('Value for ' + i + ': ');
                console.log(util.inspect(view.nodes[0].next.next, { depth: 1 }));
                console.log('\n');
            }

            //console.log(util.inspect(view.nodes, { depth: 4 }));

            //console.log('view',
            //    'VIEW:\n',
            //    view.nodes[0].html,
            //    '\ngetInnerHTML:\n',
            //    DOM.getInnerHTML(protoView.element), '\n',
            //    '\ngetOuterHTML:\n',
            //    DOM.getOuterHTML(protoView.element),
            //    '\nview.nodes[0].childNodes[0]:\n'
            //    // view.nodes[0].childNodes[0]
            //    // util.inspect(DOM.getOuterHTML(view.nodes[0]), {
            //    //   showHidden: true, depth: null
            //    // })
            //);
            // var temp = treeAdapter.createElement("template", null, []);
            // treeAdapter.appendChild(temp, view.nodes[0]);
            // var serialized = serializer.serialize(temp);
            // var newParser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);
            // return newParser.parseFragment(serialized).childNodes[0];

            // simply stick the rendered HTML for the component in the server side page
            var rendered = content.toString().
                replace('__ServerRendered__',
                '<app>'+
                '</app>'+
                DOM.getOuterHTML(protoView.element)+
                    // serialized+
                '\n'+
                '<pre>'+
                JSON.stringify(options, null, 2)+
                '</pre>'
            );

            done(null, rendered);
        });
    });
}

module.exports = function(ROOT) {
    var app = express();

    //app.use(morgan('combined'));
    app.use(morgan('dev'));
    app.engine('ng2.html', ng2Engine);
    app.set('views', path.join(ROOT, 'src'));       // specify the views directory
    app.set('view engine', 'ng2.html');             // register the template engine
    app.set('view options', { doctype: 'html' });   // set the doctype

    router.route('/')                               // routing for home page
        .get(function(req, res) {
            res.render('index', {yolo: 'yolo'});
        });
    app.use(router);
    app.use(serveStatic(ROOT + '/dist'));           // statically serve up js files

    return app;
};
