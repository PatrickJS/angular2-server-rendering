// dom closure hack
import {Parse5DomAdapter} from 'angular2/src/dom/parse5_adapter';
Parse5DomAdapter.makeCurrent();

import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent, StringWrapper} from 'angular2/src/facade/lang';

var singleTagWhitelist = {
  'br': true,
  'hr': true,
  'input': true
}

export function stringifyElement(el): string {
  var result = '';

  if (DOM.isElementNode(el)) {
    var tagName = StringWrapper.toLowerCase(DOM.tagName(el));
    // Opening tag
    result += '<' + tagName;

    // Attributes in an ordered way
    var attributeMap = DOM.attributeMap(el);
    var keys = ListWrapper.create();
    attributeMap.forEach((v, k) => { ListWrapper.push(keys, k); });
    ListWrapper.sort(keys);

    if (keys.length) {
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        result += ' ' + key + '="' + MapWrapper.get(attributeMap, key) + '"';
      }
    }

    result += '>';

    // Children
    var children = DOM.childNodes(DOM.templateAwareRoot(el));
    if (children.length) {
      for (let i = 0; i < children.length; i++) {
        result += stringifyElement(children[i]);
      }
    }

    // Closing tag
    // avoid self closing tags
    if (!singleTagWhitelist[tagName]) {
      result += '</' + tagName + '>';
    }
  } else {
    result = DOM.getText(el);
  }

  return result;
}
