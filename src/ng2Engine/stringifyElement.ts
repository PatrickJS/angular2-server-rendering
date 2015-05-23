// dom closure hack
import {Parse5DomAdapter} from 'angular2/src/dom/parse5_adapter';
Parse5DomAdapter.makeCurrent();

import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {isPresent, StringWrapper} from 'angular2/src/facade/lang';


export function stringifyElement(el): string {
  var result = '';

  if (el.name && DOM.isElementNode(el) && DOM.tagName(el)) {
    var tagName = StringWrapper.toLowerCase(DOM.tagName(el));
    // Opening tag
    result += '<' + tagName;

    // Attributes in an ordered way
    var attributeMap = DOM.attributeMap(el);
    var keys = ListWrapper.create();
    attributeMap.forEach((v, k) => { ListWrapper.push(keys, k); });
    ListWrapper.sort(keys);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      result += ' ' + key + '="' + MapWrapper.get(attributeMap, key) + '"';
    }
    result += '>';

    // Children
    var children = DOM.childNodes(DOM.templateAwareRoot(el));
    var childrenLen = children.length;
    if (childrenLen) {
      for (let i = 0; i < childrenLen; i++) {
        result += stringifyElement(children[i]);
      }
    }

    // Closing tag
    if (childrenLen) { // avoid self closing tags
      result += '</' + tagName + '>';
    }
  } else {
    result = DOM.getText(el);
  }

  return result
}
