import {Inject, Injectable, OpaqueToken} from 'angular2/di';
import {isPresent, BaseException} from 'angular2/src/facade/lang';
import {ListWrapper, Map} from 'angular2/src/facade/collection';

// client DOM
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {Content} from 'angular2/src/render/dom/shadow_dom/content_tag';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {EventManager} from 'angular2/src/render/dom/events/event_manager';

import {DomProtoView} from 'angular2/src/render/dom/view/proto_view';
import {DomView, resolveInternalDomView} from 'angular2/src/render/dom/view/view';
import {DomViewContainer} from 'angular2/src/render/dom/view/view_container';
import {NG_BINDING_CLASS_SELECTOR, NG_BINDING_CLASS} from 'angular2/src/render/dom/util';

import {RenderViewRef} from 'angular2/src/render/api';


import {DomRenderer} from 'angular2/src/render/dom/dom_renderer';
export {DomRenderer}

// TODO(tbosch): use an OpaqueToken here once our transpiler supports
// const expressions!
export const DOCUMENT_TOKEN = 'DocumentToken';

// this is used to bind a boolean during bootstrap time
// if true, it means there is a server rendered document
export const SERVER_RENDERED_TOKEN = new OpaqueToken('ServerRenderedToken');

// this is used to bind a boolean during bootstrap time
// if true, it means we are rendering on the server
export const IS_SERVER_TOKEN = new OpaqueToken('IsServerToken');


@Injectable()
export class ServerDomRenderer extends DomRenderer {
  _eventManager: EventManager;
  _shadowDomStrategy: ShadowDomStrategy;
  _document;
  _isDocumentServerRendered: boolean;
  _isServer: boolean;
  _pvCount: Map<DomProtoView, number>;
  _pvNumber: Map<DomProtoView, number>;

  constructor(eventManager: EventManager, shadowDomStrategy: ShadowDomStrategy,
              @Inject(DOCUMENT_TOKEN) document,
              @Inject(SERVER_RENDERED_TOKEN) isDocumentServerRendered,
              @Inject(IS_SERVER_TOKEN) isServer) {
    super(eventManager, shadowDomStrategy, document);
    this._isDocumentServerRendered = isDocumentServerRendered;
    this._isServer = isServer;
    this._pvCount = new Map();
    this._pvNumber = new Map();

    console.log('setting is document to ' + this._isDocumentServerRendered);
    console.log('setting is server to ' + this._isServer);

    // ensure we have the correct DomAdapter
    if (!isServer) {
      BrowserDomAdapter.makeCurrent();
    }
  }

  setDocumentServerRendered(isDocumentServerRendered: boolean) {
    this._isDocumentServerRendered = isDocumentServerRendered;
  }

  attachComponentView(hostViewRef: RenderViewRef, elementIndex: number,
                      componentViewRef: RenderViewRef) {
    var hostView = resolveInternalDomView(hostViewRef);
    var componentView = resolveInternalDomView(componentViewRef);
    var element = hostView.boundElements[elementIndex];
    var lightDom = hostView.lightDoms[elementIndex];
    if (isPresent(lightDom)) {
      lightDom.attachShadowDomView(componentView);
    }

    //jeff: don't put nodes into the DOM if document server rendered (should already be there)
    if (!this._isDocumentServerRendered) {

      // why is this affecting?
      var shadowRoot = this._shadowDomStrategy.prepareShadowRoot(element);
      this._moveViewNodesIntoParent(shadowRoot, componentView);
      componentView.shadowRoot = shadowRoot;
    }

    componentView.hostLightDom = lightDom;
  }

  hydrateView(viewRef: RenderViewRef) {
    var view = resolveInternalDomView(viewRef);
    if (view.hydrated) throw new BaseException('The view is already hydrated.');
    view.hydrated = true;

    //jw: not sure if this is what suppossed to do here
    if (!this._isDocumentServerRendered) {
      for (var i = 0; i < view.lightDoms.length; ++i) {
        var lightDom = view.lightDoms[i];
        if (isPresent(lightDom)) {
          lightDom.redistribute();
        }
      }
    }

    // add global events
    view.eventHandlerRemovers = ListWrapper.create();
    var binders = view.proto.elementBinders;
    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      if (isPresent(binder.globalEvents)) {
        for (var i = 0; i < binder.globalEvents.length; i++) {
          var globalEvent = binder.globalEvents[i];
          var remover = this._createGlobalEventListener(view, binderIdx, globalEvent.name,
                                                        globalEvent.target, globalEvent.fullName);
          ListWrapper.push(view.eventHandlerRemovers, remover);
        }
      }
    }

    //jw: again not sure about this, but trying it out
    if (isPresent(view.hostLightDom) && !this._isDocumentServerRendered) {
      view.hostLightDom.redistribute();
    }
  }

  dehydrateView(viewRef: RenderViewRef) {
    var view = resolveInternalDomView(viewRef);

    // remove global events
    // pjs: we don't have events on server
    if (!this._isServer) {
      for (var i = 0; i < view.eventHandlerRemovers.length; i++) {
        view.eventHandlerRemovers[i]();
      }
    }

    view.eventHandlerRemovers = null;
    view.hydrated = false;
  }


  //jeff: generate protovideId based on pv component name +
  _getProtoViewId(protoView: DomProtoView) {
    var nbr = this._pvNumber.get(protoView) || (this._pvNumber.size + 1);
    this._pvNumber.set(protoView, nbr);

    var count = this._pvCount.get(protoView) || 0;
    count++;
    this._pvCount.set(protoView, count);

    return nbr + '-' + count;
  }

  _createClientViewFromServerView(protoView: DomProtoView, inplaceElement): DomView {
    var view = this._createView(protoView, inplaceElement);
    if (!view) {
      this._isDocumentServerRendered = false;
      view = this._createView(protoView, inplaceElement);
    }
    return view;
  }

  _createView(protoView: DomProtoView, inplaceElement): DomView {

    //jeff: get the protoview ID to be used on the element for client rebinding of server generated page
    var pvId = this._getProtoViewId(protoView);

    var rootElementClone =
      isPresent(inplaceElement) ? inplaceElement : DOM.importIntoDoc(protoView.element);
    var elementsWithBindingsDynamic;
    if (protoView.isTemplateElement) {
      elementsWithBindingsDynamic =
        DOM.querySelectorAll(DOM.content(rootElementClone), NG_BINDING_CLASS_SELECTOR);
    } else {
      elementsWithBindingsDynamic = DOM.getElementsByClassName(rootElementClone, NG_BINDING_CLASS);
    }

    var elementsWithBindings = ListWrapper.createFixedSize(elementsWithBindingsDynamic.length);
    for (var binderIdx = 0; binderIdx < elementsWithBindingsDynamic.length; ++binderIdx) {
      elementsWithBindings[binderIdx] = elementsWithBindingsDynamic[binderIdx];
    }

    var viewRootNodes;
    if (protoView.isTemplateElement) {
      var childNode = DOM.firstChild(DOM.content(rootElementClone));
      viewRootNodes =
        [];  // TODO(perf): Should be fixed size, since we could pre-compute in in DomProtoView
      // Note: An explicit loop is the fastest way to convert a DOM array into a JS array!
      while (childNode != null) {
        ListWrapper.push(viewRootNodes, childNode);
        childNode = DOM.nextSibling(childNode);
      }
    } else {
      viewRootNodes = [rootElementClone];
    }
    var binders = protoView.elementBinders;
    var boundTextNodes = [];
    var boundElements = ListWrapper.createFixedSize(binders.length);
    var contentTags = ListWrapper.createFixedSize(binders.length);

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element;
      if (binderIdx === 0 && protoView.rootBindingOffset === 1) {
        element = rootElementClone;
      } else {
        element = elementsWithBindings[binderIdx - protoView.rootBindingOffset];
      }

      //jeff: if this is the server set the ID (base64 encode?)
      var elementId = 'ng-' + pvId + '-' + (binderIdx + 1);
      if (this._isServer) {
        DOM.addClass(element, elementId);
      }
      //jeff: else if document server rendered, then get the element from the DOM with the ID
      else if (this._isDocumentServerRendered) {
        element = DOM.query('.' + elementId);
      }

      boundElements[binderIdx] = element;

      // boundTextNodes
      var childNodes = DOM.childNodes(DOM.templateAwareRoot(element));
      var textNodeIndices = binder.textNodeIndices;
      for (var i = 0; i < textNodeIndices.length; i++) {
        ListWrapper.push(boundTextNodes, childNodes[textNodeIndices[i]]);
      }

      // contentTags
      var contentTag = null;
      if (isPresent(binder.contentTagSelector)) {
        contentTag = new Content(element, binder.contentTagSelector);
      }
      contentTags[binderIdx] = contentTag;
    }

    var view = new DomView(protoView, viewRootNodes, boundTextNodes, boundElements, contentTags);

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element = boundElements[binderIdx];

      // lightDoms
      var lightDom = null;
      if (isPresent(binder.componentId)) {
        lightDom = this._shadowDomStrategy.constructLightDom(view, boundElements[binderIdx]);
      }
      view.lightDoms[binderIdx] = lightDom;

      // init contentTags
      var contentTag = contentTags[binderIdx];
      if (isPresent(contentTag)) {
        var destLightDom = view.getDirectParentLightDom(binderIdx);
        contentTag.init(destLightDom);
      }

      // events
      if (isPresent(binder.eventLocals) && isPresent(binder.localEvents)) {
        for (var i = 0; i < binder.localEvents.length; i++) {
          this._createEventListener(view, element, binderIdx, binder.localEvents[i].name,
            binder.eventLocals);
        }
      }
    }

    return view;
  }
}
