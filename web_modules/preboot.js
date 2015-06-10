(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.preboot = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./listen/listen_by_selectors.js":[function(require,module,exports){
/**
 * Author: Jeff Whelpley
 * Date: 6/2/15
 *
 * Listen by an explicit list of selectors mapped to a set of events
 *
 * @param strategy
 * @param opts
 */
function getNodeEvents(strategy, opts) {
    var nodeEvents = [];
    var root = opts.serverRoot || opts.document;
    var eventsBySelector = strategy.eventsBySelector || {};
    var selectors = Object.keys(eventsBySelector);
    var selectorIdx, selector, elem, elems, i, j, events;

    // loop through selectors
    for (selectorIdx = 0; selectorIdx < selectors.length; selectorIdx++) {
        selector = selectors[selectorIdx];
        events = eventsBySelector[selector];
        elems = root.querySelectorAll(selector);

        // only do something if there are elements found
        if (elems) {

            // loop through elements
            for (i = 0; i < elems.length; i++) {
                elem = elems[i];

                // loop through events
                for (j = 0; j < events.length; j++) {
                    nodeEvents.push({
                        node:       elem,
                        eventName:  events[j]
                    });
                }
            }
        }
    }

    return nodeEvents;
}


module.exports = {
    getNodeEvents: getNodeEvents
};
},{}],"./replay/replay_after_rerender.js":[function(require,module,exports){
/**
 * Author: Jeff Whelpley
 * Date: 6/2/15
 *
 * This replay strategy assumes that the client completely re-rendered
 * the page so reboot will need to find the element in the new client
 * rendered DOM that matches the element it has in memory.
 */
var domSelector = require('../select/dom_selector');

/**
 * Loop through all events and replay each by trying to find a node
 * that most closely resembles the original.
 *
 * @param events
 * @param strategy
 * @param opts
 * @returns {Array}
 */
function replayEvents(events, strategy, opts) {
    var i, eventData, serverNode, clientNode, event;
    var remainingEvents = [];
    events = events || [];

    // loop through the events, find the appropriate client node and dispatch the event
    for (i = 0; i < events.length; i++) {
        eventData = events[i];
        event = eventData.event;
        serverNode = eventData.node;
        clientNode = domSelector.findClientNode(serverNode, opts);

        if (clientNode) {
            clientNode.dispatchEvent(event);
            clientNode.value = serverNode.value;  // need to explicitly set value since keypress events won't transfer
        }
        else {
            remainingEvents.push(eventData);
        }
    }

    return remainingEvents;
}

module.exports = {
    replayEvents: replayEvents
};
},{"../select/dom_selector":5}],1:[function(require,module,exports){
/**
 * Author: Jeff Whelpley
 * Date: 6/2/15
 *
 * Manage the switching of buffers
 */
var state = {
    switched: false
};

/**
 * The client is hidden while the client is bootstrapping
 * @param clientRoot
 */
function hideClient(clientRoot) {
    clientRoot.style.display = 'none';
}

/**
 * We want to simultaneously remove the server node from the DOM
 * and display the client node
 *
 * @param opts
 */
function switchBuffer(opts) {
    var clientRoot = opts.clientRoot;
    var serverRoot = opts.serverRoot;

    // don't do anything if already switched
    if (state.switched) { return; }

    // remove the server root if not same as client and not the body
    if (serverRoot && serverRoot !== clientRoot && serverRoot.nodeName !== 'BODY') {
        serverRoot.remove ?
            serverRoot.remove() :
            serverRoot.style.display = 'none';
    }

    // display the client and mark state as switched
    clientRoot.style.display = 'block';
    state.switched = true;
}

module.exports = {
    state: state,
    hideClient: hideClient,
    switchBuffer: switchBuffer
};
},{}],2:[function(require,module,exports){
/**
 * Author: Jeff Whelpley
 * Date: 6/2/15
 *
 * Handling events on the client side
 */
var state = {
    eventListeners: [],
    events: [],
    overlay: null
};

/**
 * Hide the overlay by setting to display none
 */
function hideOverlay() {
    if (state.overlay) {
        state.overlay.style.display = 'none';
    }
}


function createOverlay(document, timeout) {
    var overlay = state.overlay = document.createElement('div');
    var style = overlay.style;

    overlay.className = 'preboot-overlay';
    style.zIndex = '9999999';
    style.position = 'absolute';
    style.top = '0';
    style.left = '0';
    style.width = '100%';
    style.height = '100%';
    style.background = '#263741';
    style.display = 'none';
    style.opacity = '.27';
    // document.body.appendChild(overlay);

    // hide overlay after 4 seconds regardless of whether bootstrap complete
    // setTimeout(hideOverlay, (timeout || 4000));
    return overlay;
}

function createProgress(document) {
  var progress = document.createElement('div');
  progress.id = '567567567567';
  progress.className = 'progress'
  progress.style.display = 'none';
  return progress;
}


/**
 * Display overlay by sticking div at end of body
 * @param document
 * @param timeout - So that we can timeout quickly for unit tests
 */
window.displayOverlay = function displayOverlay(document, timeout, event) {


  var hasProgress = state.overlay//document.getElementById('567567567567');
  // var overlay = state.overlay = createOverlay(document, timeout);
  // document.body.appendChild(overlay);

  if (hasProgress) {
    if (event && event.target && event.target.parentElement) {

      state.targetElement = event.target;
      var progress = document.getElementById('567567567567');
      progress.style.display = 'inline';
      event.target.parentElement.appendChild(progress)

    }

    hasProgress.style.display = 'inline';
    state.overlay = hasProgress;

  } else {
    var progress = createProgress(document);

    // var overlay = createOverlay(document, timeout)
    // overlay.appendChild(progress);

    state.overlay = progress;
    // state.overlay = overlay;

    if (event && event.target && event.target.parentElement) {

      state.targetElement = event.target;
      event.target.parentElement.appendChild(state.overlay)

    } else {
      document.body.appendChild(state.overlay);
    }

  }

    // hide overlay after 4 seconds regardless of whether bootstrap complete
    // setTimeout(hideOverlay, (timeout || 4000));
}

/**
 * For a given node, add an event listener based on the given attribute. The attribute
 * must match the Angular pattern for event handlers (i.e. either (event)='blah()' or
 * on-event='blah'
 *
 * @param document
 * @param strategy
 * @param node
 * @param eventName
 */
function getEventHandler(document, strategy, node, eventName) {
    return function (event) {

        // we want to wait until client bootstraps so don't allow default action
        if (strategy.preventDefault) {
            event.preventDefault();
        }

        // if we want to raise an event that others can listen for
        if (strategy.dispatchEvent) {
            document.dispatchEvent(new window.Event(strategy.dispatchEvent));
        }

        // if callback provided for a custom action when an event occurs
        if (strategy.action) {
            strategy.action(node, event);
        }

        // if we should show overlay when user hits button so there is no further action
        if (strategy.overlay) {
            displayOverlay(document, null, event);
        }

        // we will record events for later replay unless explicitly marked as doNotReplay
        if (!strategy.doNotReplay) {
            state.events.push({
                node:       node,
                event:      event,
                name:       eventName,
                time:       (new Date()).getTime()
            });
        }
    };
}

/**
 * Loop through node events and add listeners
 * @param nodeEvents
 * @param strategy
 * @param opts
 */
function addEventListeners(nodeEvents, strategy, opts) {
    for (var i = 0; i < nodeEvents.length; i++) {
        var nodeEvent = nodeEvents[i];
        var node = nodeEvent.node;
        var eventName = nodeEvent.eventName;
        var document = opts.document;
        var handler = getEventHandler(document, strategy, node, eventName);

        // add the actual event listener and keep a ref so we can remove the listener during cleanup
        node.addEventListener(eventName, handler);
        state.eventListeners.push({
            node:       node,
            name:       eventName,
            handler:    handler
        });
    }
}

/**
 * Add event handlers
 * @param opts
 */
function startListening(opts) {
    var listenStrategies = opts.listen || [];

    for (var i = 0; i < listenStrategies.length; i++) {
        var strategy = listenStrategies[i];

        // we either use custom strategy or one from the listen dir
        var getNodeEvents = strategy.getNodeEvents ||
            require('./listen/listen_by_' + strategy.name + '.js').getNodeEvents;

        // get array of objs with 1 node and 1 event; add event listener for each
        var nodeEvents = getNodeEvents(strategy, opts);
        addEventListeners(nodeEvents, strategy, opts);
    }
}

/**
 * Loop through replay strategies and call replayEvents functions
 * @param opts
 */
function replayEvents(opts) {
    var replayStrategies = opts.replay || [];

    for (var i = 0; i < replayStrategies.length; i++) {
        var strategy = replayStrategies[i];

        // we either use custom strategy or one from the listen dir
        var replayEvts = strategy.replayEvents ||
            require('./replay/replay_after_' + strategy.name + '.js').replayEvents;

        // get array of objs with 1 node and 1 event; add event listener for each
        state.events = replayEvts(state.events, strategy, opts);
    }

    //TODO: figure out better solution for remaining events
    // if some events are remaining, log to the console
    //if (state.events && state.events.length) {
    //    console.log('Not all events replayed: ');
    //    console.log(state.events);
    //}
}

/**
 * Go through all the event listeners and clean them up
 * by removing them from the given node (i.e. element)
 */
function cleanup() {
    var listener, node;

    // first cleanup the event listeners
    for (var i = 0; i < state.eventListeners.length; i++) {
        listener = state.eventListeners[i];
        node = listener.node;
        node.removeEventListener(listener.name, listener.handler);
    }

    // hide overlay if it exists
    hideOverlay();

    // now remove the events
    state.events = [];
}

module.exports = {
    state: state,
    hideOverlay: hideOverlay,
    displayOverlay: displayOverlay,
    getEventHandler: getEventHandler,
    addEventListeners: addEventListeners,
    startListening: startListening,
    replayEvents: replayEvents,
    cleanup: cleanup
};
},{}],3:[function(require,module,exports){
/**
 * Copyright 2014 GetHuman LLC
 * Author: Jeff Whelpley
 * Date: 6/2/15
 *
 * Manage focus
 */
var domSelector = require('../select/dom_selector');
var state = {
    currentFocus: null,
    trackingEnabled: false
};

/**
 * Check the focus and then recursively call again after 50ms.
 * If tracking not enabled, though, returned w/o doing anything.
 * @param document
 */
function checkFocus(document) {
    if (state.trackingEnabled) {

        // if no active element, keep a ref for the last known one
        state.currentFocus = document.activeElement || state.currentFocus;

        // call this again recursively after 50 milliseconds
        var focusTimeout = setTimeout(function () {
            clearTimeout(focusTimeout);
            checkFocus(document);
        }, 0);
    }
}

/**
 * Start tracking focus on the page
 * @param document
 */
function startTracking(document) {
    state.trackingEnabled = true;
    function focusin(e) {
      state.currentFocus = e.target || e.targetElement;
      console.log('focusin!')
    }
    function focusout() {
      document.removeEventListener('focusin', focusin);
      document.removeEventListener('focusout', focusout);

    }
    document.addEventListener('focusin', focusin, true);
    document.addEventListener('focusout', focusout);
    // checkFocus(document);
}

/**
 * This will stop state.currentFocus ref from changing
 */
function stopTracking() {
    state.trackingEnabled = false;
}

/**
 * Set focus at the last known location
 * @param opts
 */
function setFocus(opts) {
    var clientNode = domSelector.findClientNode(state.currentFocus, opts);
    if (clientNode) {
        clientNode.focus();

        //TODO: if input box, put cursor at the end of the text
    }
}

module.exports = {
    state: state,
    checkFocus: checkFocus,
    startTracking: startTracking,
    stopTracking: stopTracking,
    setFocus: setFocus
};
},{"../select/dom_selector":5}],4:[function(require,module,exports){
/**
 * Author: Jeff Whelpley
 * Date: 6/2/15
 *
 * This is the main entry point for the client side bootstrap library.
 * This will be browserified and then inlined in the head of an HTML
 * document along with a call to this module that passes in the
 * browser document object and all the options. See the
 * preboot_server to see how this code is generated and inserted
 * into HTML. At a high level what is happening here is:
 *
 *      1) Start tracking events
 *      2) Start tracking focus
 *      3) Once bootstrap is complete:
 *              A) replay all events
 *              B) switch from the server buffer to the client buffer
 *              C) set focus at the last known location
 *              D) cleanup all resources
 *
 * Note that many of these steps are options and can be configured through
 * the opts input object. In the future we will optimize the amount of code
 * needed by doing custom builds where the code not needed would not be
 * included in the final client side JS generated.
 *
 * @param document
 * @param opts See README for details
 */
var eventManager = require('./event_manager');
var focusManager = require('./focus/focus_manager');
var bufferManager = require('./buffer/buffer_manager');
var state = {
    canComplete: true,      // set to false if preboot paused through an event
    completeCalled: false   // set to true once the completion event has been raised
};

/**
 * Most of the options should have been normalized by the clientCodeGenerator, so if
 * no options here, throw error. Really all this is for is to add window/document
 * based objects to the opts.
 *
 * @param opts
 */
function normalizeOptions(opts) {
    var document = opts.document = window.document;
    opts.serverRoot = document.querySelectorAll(opts.serverRoot || opts.clientRoot || 'body')[0];
    opts.clientRoot = opts.clientRoot ? document.querySelectorAll(opts.clientRoot)[0] : opts.serverRoot;
}

/**
 * Get function to run once window has loaded
 * @param opts
 * @returns {Function}
 */
function getOnLoadHandler(opts) {
    return function onLoad() {

        normalizeOptions(opts);                                 // get the server and client roots

        if (opts.buffer) {
            bufferManager.hideClient(opts.clientRoot);          // make sure client root is hidden
        }

        eventManager.startListening(opts);                      // add all the event handlers

        if (opts.focus) {
            focusManager.startTracking(opts.document);          // start tracking focus on the page
        }
    };
}

/**
 * Get a function to run once bootstrap has completed
 * @param opts
 * @returns {Function}
 */
function getBootstrapCompleteHandler(opts) {
    return function onComplete(event) {

      console.log('got BootstrapComplete');

        // track that complete has been called and don't do anything if we can't complete
        state.completeCalled = true;
        if (!state.canComplete) { return; }

        // can complete, so run it
        if (opts.focus) { focusManager.stopTracking(); }        // stop tracking focus so we retain the last focus
        eventManager.replayEvents(opts);                        // replay events on client DOM
        if (opts.buffer) { bufferManager.switchBuffer(opts); }  // switch from server to client buffer
        if (opts.focus) { focusManager.setFocus(opts); }        // set focus on client buffer
        eventManager.cleanup();                                 // cleanup event listeners
    };
}

/**
 * Pause the completion process
 */
function pauseCompletion() {
    state.canComplete = false;
}

/**
 * Resume the completion process; if complete already called,
 * call it again right away.
 *
 * @param opts
 * @returns {Function}
 */
function getResumeCompleteHandler(opts) {
    return function onPause(event) {
        state.canComplete = true;

        if (state.completeCalled) {

            // using setTimeout to fix weird bug where err thrown on
            // serverRoot.remove() in buffer switch
            var completeTimer = setTimeout(function () {
                clearTimeout(completeTimer);
                getBootstrapCompleteHandler(opts)(event);
            }, 50);
        }
    };
}

/**
 * Start preboot
 * @param opts
 */
function start(opts) {
    // need to rebuild rather than global
    window.displayOverlay(document);

    window.addEventListener('load', getOnLoadHandler(opts));
    window.document.addEventListener(opts.pauseEvent, pauseCompletion);
    window.document.addEventListener(opts.resumeEvent, getResumeCompleteHandler(opts));
    window.document.addEventListener(opts.completeEvent, getBootstrapCompleteHandler(opts));
}

// only expose start
module.exports = {
    eventManager: eventManager,
    focusManager: focusManager,
    bufferManager: bufferManager,
    start: start
};

},{"./buffer/buffer_manager":1,"./event_manager":2,"./focus/focus_manager":3}],5:[function(require,module,exports){
/**
 * Author: Jeff Whelpley
 * Date: 6/4/15
 *
 * This is used when there is a rerender and we need to find the
 * client rendered node that matches a server rendered node. It
 * is used by replay_after_rerender and focus_manager
 */
var nodeCache = {};

/**
 * Get a unique key for a node in the DOM
 * @param node
 * @param rootNode - Need to know how far up we go
 */
function getNodeKey(node, rootNode) {
    var ancestors = [];
    var temp = node;
    while (temp && temp !== rootNode) {
        ancestors.push(temp);
        temp = temp.parentNode;
    }

    // push the rootNode on the ancestors
    if (temp) {
        ancestors.push(temp);
    }

    // now go backwards starting from the root
    var key = node.nodeName;
    var len = ancestors.length;
    var i, j;

    for (i = (len - 1); i >= 0; i--) {
        temp = ancestors[i];

        //key += '_d' + (len - i);

        if (temp.childNodes && i > 0) {
            for (j = 0; j < temp.childNodes.length; j++) {
                if (temp.childNodes[j] === ancestors[i - 1]) {
                    key += '_s' + (j + 1);
                    break;
                }
            }
        }
    }

    return key;
}

/**
 * Given a node from the server rendered view, find the equivalent
 * node in the client rendered view.
 *
 * @param serverNode
 * @param opts
 */
function findClientNode(serverNode, opts) {

    // if nothing passed in, then no client node
    if (!serverNode) { return null; }

    // we use the string of the node to compare to the client node & as key in cache
    var serverNodeKey = getNodeKey(serverNode, opts.serverRoot);

    // first check to see if we already mapped this node
    var nodes = nodeCache[serverNodeKey] || [];
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].serverNode === serverNode) {
            return nodes[i].clientNode;
        }
    }

    //TODO: improve this algorithm in the future
    var selector = serverNode.tagName;
    if (serverNode.id) {
        selector += '#' + serverNode.id;
    }
    else if (serverNode.className) {
        selector += serverNode.className.replace(/ /g, '.');
    }

    var root = opts.clientRoot || opts.document;
    var clientNodes = root.querySelectorAll(selector);
    for (i = 0; clientNodes && i < clientNodes.length; i++) {
        var clientNode = clientNodes[i];

        //TODO: this assumes a perfect match which isn't necessarily true
        if (getNodeKey(clientNode, opts.clientRoot) === serverNodeKey) {

            // add the client/server node pair to the cache
            nodeCache[serverNodeKey] = nodeCache[serverNodeKey] || [];
            nodeCache[serverNodeKey].push({
                clientNode: clientNode,
                serverNode: serverNode
            });

            return clientNode;
        }
    }

    // if we get here it means we couldn't find the client node
    return null;
}

module.exports = {
    nodeCache: nodeCache,
    getNodeKey: getNodeKey,
    findClientNode: findClientNode
};
},{}]},{},[4])(4)
});

preboot.start({"focus":true,"keyPress":true,"buttonPress":true,"replay":[{"name":"rerender"}],"serverRoot":"app","clientRoot":"app","pauseEvent":"PrebootPause","resumeEvent":"PrebootResume","completeEvent":"BootstrapComplete","listen":[{"name":"selectors","eventsBySelector":{"input[type=\"text\"]":["keypress","keyup","keydown"],"textarea":["keypress","keyup","keydown"]}},{"name":"selectors","overlay":true,"preventDefault":true,"eventsBySelector":{"input[type=\"submit\"]":["click"],"button":["click"]}}]});

