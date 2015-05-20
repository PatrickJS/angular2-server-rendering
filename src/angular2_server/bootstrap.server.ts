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
import {DomRenderer, DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {resolveInternalDomView} from 'angular2/src/render/dom/view/view';
import {DefaultDomCompiler} from 'angular2/src/render/dom/compiler/compiler';
import {internalView} from 'angular2/src/core/compiler/view_ref';

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

      bind(appComponentTypeToken).toValue(appComponentType),
      bind(appComponentRefToken).toAsyncFactory((dynamicComponentLoader, injector,
        testability, registry) => {

        // TODO(rado): investigate whether to support bindings on root component.
        return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector).then( (componentRef) => {
          var domView = resolveInternalDomView(componentRef.hostView.render);
          // We need to do this here to ensure that we create Testability and
          // it's ready on the window for users.
          registry.registerApplication(domView.boundElements[0], testability);

          return componentRef;
        });
      }, [DynamicComponentLoader, Injector,
        Testability, TestabilityRegistry]),

      bind(appComponentType).toFactory((ref) => ref.instance,
          [appComponentRefToken]),
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
      bind(DomRenderer).toFactory(
          (eventManager, shadowDomStrategy, doc) => new DomRenderer(eventManager, shadowDomStrategy, doc),
          [EventManager, ShadowDomStrategy, DOCUMENT_TOKEN]
      ),
      DefaultDomCompiler,
      bind(Renderer).toAlias(DomRenderer),
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
                          componentInjectableBindings: List<Binding> = null,
                          errorReporter: Function = null): Promise<ApplicationRef> {
  // BrowserDomAdapter.makeCurrent();
  var bootstrapProcess = PromiseWrapper.completer();

  var zone = _createNgZone(errorReporter);
  zone.run(() => {
    // TODO(rado): prepopulate template cache, so applications with only
    // index.html and main.js are possible.

    var appInjector = _createAppInjector(appComponentType, componentInjectableBindings, zone);

    PromiseWrapper.then(appInjector.asyncGet(appComponentRefToken),
      (componentRef) => {
        var appChangeDetector = internalView(componentRef.hostView).changeDetector;
        // retrieve life cycle: may have already been created if injected in root component
        var lc = appInjector.get(LifeCycle);
        lc.registerWith(zone, appChangeDetector);
        lc.tick(); //the first tick that will bootstrap the app

        bootstrapProcess.resolve(new ApplicationRef(componentRef, appComponentType, appInjector));
      },

      (err, stackTrace) => {
        bootstrapProcess.reject(err, stackTrace)
      });
  });

  return bootstrapProcess.promise;
}

export class ApplicationRef {
  _hostComponent:ComponentRef;
  _injector:Injector;
  _hostComponentType:Type;
  constructor(hostComponent:ComponentRef, hostComponentType:Type, injector:Injector) {
    this._hostComponent = hostComponent;
    this._injector = injector;
    this._hostComponentType = hostComponentType;
  }

  get hostComponentType() {
    return this._hostComponentType;
  }

// Server
  get hostElementRef() {
    return this._hostComponentType.location
  }
// Server

  get hostComponent() {
    return this._hostComponent.instance;
  }

  dispose() {
    // TODO: We also need to clean up the Zone, ... here!
    return this._hostComponent.dispose();
  }

  get injector() {
    return this._injector;
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
