import {Injector, bind, OpaqueToken} from 'angular2/di';
import {NumberWrapper, Type, isBlank, isPresent, BaseException,
    assertionsEnabled, print, stringify} from 'angular2/src/facade/lang';

// import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

import {DOM} from 'angular2/src/dom/dom_adapter';

//
import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
//

import {Reflector, reflector} from 'angular2/src/reflection/reflection';
import {Parser, Lexer, ChangeDetection, DynamicChangeDetection, PipeRegistry, defaultPipeRegistry} from 'angular2/change_detection';

//
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
//

import {TemplateLoader} from 'angular2/src/render/dom/compiler/template_loader';

//
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
//

//
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
//

import {List, ListWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {EmulatedUnscopedShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy';
import {XHR} from 'angular2/src/services/xhr';
import {XHRImpl} from 'angular2/src/services/xhr_impl';
import {EventManager, DomEventsPlugin} from 'angular2/src/render/dom/events/event_manager';
import {KeyEventsPlugin} from 'angular2/src/render/dom/events/key_events';
import {HammerGesturesPlugin} from 'angular2/src/render/dom/events/hammer_gestures';
import {Binding} from 'angular2/src/di/binding';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {ComponentRef, DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';
import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {Renderer, RenderCompiler} from 'angular2/src/render/api';

//import {IsoDomRenderer, DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {IsoDomRenderer, DOCUMENT_TOKEN, SERVER_RENDERED_TOKEN, IS_SERVER_TOKEN} from '../angular2_client/iso_dom_renderer';

import {resolveInternalDomView} from 'angular2/src/render/dom/view/view';
import {DefaultDomCompiler} from 'angular2/src/render/dom/compiler/compiler';
import {internalView} from 'angular2/src/core/compiler/view_ref';
// Server
import {ElementRef} from 'angular2/src/core/compiler/element_ref';
// Server

//
import {
  appComponentRefToken,
  appComponentTypeToken
} from 'angular2/src/core/application_tokens';
//


var _rootInjector: Injector;

// Contains everything that is safe to share between applications.
var _rootBindings = [
  bind(Reflector).toValue(reflector),
  TestabilityRegistry
];

function _injectorBindings(appComponentType): List<Binding> {
  return [
      bind(DOCUMENT_TOKEN).toValue(DOM.defaultDoc()),

      // needed for the IsoDomRenderer
      bind(SERVER_RENDERED_TOKEN).toValue(false),
      bind(IS_SERVER_TOKEN).toValue(true),          // should this be in app.server.ts or here? prob want to unify bootstraps at some point

      // Server: remove ref
      // Server
      bind(appComponentType).toFactory((ref) => ref.instance, [appComponentRefToken]),
      bind(LifeCycle).toFactory((exceptionHandler) => new LifeCycle(exceptionHandler, null, assertionsEnabled()),[ExceptionHandler]),
      bind(EventManager).toFactory((ngZone) => {
        var plugins = [new HammerGesturesPlugin(), new KeyEventsPlugin(), new DomEventsPlugin()];
        return new EventManager(plugins, ngZone);
      }, [NgZone]),
      bind(ShadowDomStrategy).toFactory(
          (styleUrlResolver, doc) => new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, doc.head),
          [StyleUrlResolver, DOCUMENT_TOKEN]),
      // TODO(tbosch): We need an explicit factory here, as
      // we are getting errors in dart2js with mirrors...
      bind(IsoDomRenderer).toFactory(
          (eventManager, shadowDomStrategy, doc, isServerRendered, isServer) => new IsoDomRenderer(eventManager, shadowDomStrategy, doc, isServerRendered, isServer),
          [EventManager, ShadowDomStrategy, DOCUMENT_TOKEN, SERVER_RENDERED_TOKEN, IS_SERVER_TOKEN]
      ),
      DefaultDomCompiler,
      bind(Renderer).toAlias(IsoDomRenderer),
      bind(RenderCompiler).toAlias(DefaultDomCompiler),
      ProtoViewFactory,
      // TODO(tbosch): We need an explicit factory here, as
      // we are getting errors in dart2js with mirrors...
      bind(AppViewPool).toFactory(
        (capacity) => new AppViewPool(capacity),
        [APP_VIEW_POOL_CAPACITY]
      ),
      bind(APP_VIEW_POOL_CAPACITY).toValue(10000),
      AppViewManager,
      AppViewManagerUtils,
      Compiler,
      CompilerCache,
      TemplateResolver,
      bind(PipeRegistry).toValue(defaultPipeRegistry),
      bind(ChangeDetection).toClass(DynamicChangeDetection),
      TemplateLoader,
      DirectiveResolver,
      Parser,
      Lexer,
      ExceptionHandler,
      bind(XHR).toValue(new XHRImpl()),
      ComponentUrlMapper,
      UrlResolver,
      StyleUrlResolver,
      StyleInliner,
      DynamicComponentLoader,
      Testability
  ];
}

function _createNgZone(givenReporter:Function): NgZone {
  var defaultErrorReporter = (exception, stackTrace) => {
    var longStackTrace = ListWrapper.join(stackTrace, "\n\n-----async gap-----\n");
    DOM.logError(`${exception}\n\n${longStackTrace}`);
    throw exception;
  };

  var reporter = isPresent(givenReporter) ? givenReporter : defaultErrorReporter;

  var zone = new NgZone({enableLongStackTrace: assertionsEnabled()});
  zone.initCallbacks({onErrorHandler: reporter});
  return zone;
}



export function bootstrap(appComponentType: Type,
                          appInjector: any = null,
                          componentInjectableBindings: List<Binding> = null,
                          errorReporter: Function = null): Promise {
  let bootstrapProcess = PromiseWrapper.completer();

  // TODO(rado): prepopulate template cache, so applications with only
  // index.html and main.js are possible.
  let zone = _createNgZone();


  let bindingsCmpLoader = [DynamicComponentLoader, Injector, Testability, TestabilityRegistry];
  let componentLoader   = (dynamicComponentLoader, injector, testability, registry) => {
    // TODO(rado): investigate whether to support bindings on root component.
    return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector).then( (componentRef) => {
      var domView = resolveInternalDomView(componentRef.hostView.render);
      // We need to do this here to ensure that we create Testability and
      // it's ready on the window for users.
      registry.registerApplication(domView.boundElements[0], testability);
      return componentRef;
    });
  };

  let serverBindings = [
    bind(appComponentTypeToken).toValue(appComponentType),
    // bind(appComponentRefToken).toAsyncFactory(componentLoader, bindingsCmpLoader)
  ];

  // Server
  let mergedBindings = isPresent(componentInjectableBindings) ?
    ListWrapper.concat(componentInjectableBindings, serverBindings) : serverBindings;

  if (!appInjector) {

    appInjector = _createAppInjector(appComponentType, mergedBindings, zone);

  } else {

    appInjector.resolveAndCreateChild(mergedBindings);

  }
  // Server

  PromiseWrapper.then(
    PromiseWrapper.all([
      appInjector.asyncGet(DynamicComponentLoader),
      appInjector.asyncGet(Testability),
      appInjector.asyncGet(TestabilityRegistry)
    ])
    .then(results => {
      return componentLoader(results[0], appInjector, results[1], results[2]);
    }),
    (componentRef) => {
      var appChangeDetector = internalView(componentRef.hostView).changeDetector;

      bootstrapProcess.resolve(
        new ApplicationRef(componentRef, appComponentType, appInjector, appChangeDetector)
      );
    },
    (err, stackTrace) => {
      bootstrapProcess.reject(err, stackTrace)
    }
  );
  // Server

  return bootstrapProcess.promise;
}

export class ApplicationRef {
  _hostComponent:ComponentRef;
  _hostComponentType:Type;
  _hostElementRef:ElementRef;
  _injector:Injector;
  _changeDetection:ChangeDetection;
  constructor(
    hostComponent:ComponentRef, hostComponentType:Type, injector:Injector, changeDetection: ChangeDetection) {
    this._hostComponent = hostComponent;
    this._injector = injector;
    this._hostComponentType = hostComponentType;
    // Server
    this._changeDetection = changeDetection;
    // Server
  }

  get hostComponentType() {
    return this._hostComponentType;
  }

// Server
  get hostElementRef() {
    return this._hostComponent.location;
  }

  get changeDetection() {
    return this._changeDetection;
  }
// Server

  get hostComponent() {
    return this._hostComponent.instance;
  }

  get injector() {
    return this._injector;
  }

  dispose() {
    // Server
    this._injector = null;
    this._changeDetection = null;
    // Server

    // TODO: We also need to clean up the Zone, ... here!
    return this._hostComponent.dispose();
  }
}

function _createAppInjector(appComponentType: Type, bindings: List<Binding>, zone: NgZone): Injector {
  if (isBlank(_rootInjector)) {
    _rootInjector = Injector.resolveAndCreate(_rootBindings);
  }

  var mergedBindings = isPresent(bindings) ?
      ListWrapper.concat(_injectorBindings(appComponentType), bindings) :
      _injectorBindings(appComponentType);
  ListWrapper.push(mergedBindings, bind(NgZone).toValue(zone));

  return _rootInjector.resolveAndCreateChild(mergedBindings);
}
