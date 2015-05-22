/*

TODO:
allow [value] and [checked] bindings
figure out eventManager bug

*/


// lol hackmap used in mvp
/*
var _tags = {
  'div': ['<div>', '</div>'],
  'menu': ['<menu>', '</menu>'],
  'nav': ['<nav>', '</nav>'],
  'section': ['<section>', '</section>'],
  'span': ['<span>', '</span>'],
  'a': ['<a>', '</a>'],
  'b': ['<b>', '</b>'],
  'i': ['<i>', '</i>'],
  'strong': ['<strong>', '</strong>'],
  'options': ['<options>', '</options>'],
  // 'template': ['   ', '   ']
  'template': ['<template>', '</template>']
};
*/
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

var hasAttrValue = {
  'class': true,
  'id': true,
  'style': true,
  'for': true,
  'href': true,
  'type': true,
  'placeholder': true,
  'rel': true,
  'media':true,
  'title':true,
  'charset': true,
  'select': true
};


function openTag(node) {
  var attributes = node.attribs;

  var tag = '<'+node.name;

  if (attributes) {
    tag += ' ';

    for (var attr in attributes) {
      if (hasAttrValue[attr]) {
        tag = tag + (attr + '="' + attributes[attr] + '"');
      }
      // if bind attr
      else if (attr[0] === '[' && attr[attr.length-1] === ']') {
        // console.log('[SWAG]', attr+'="'+attributes[attr]+'"', tag)
        // tag = tag + attr.replace('[', '').replace(']', '') + '="' + attributes[attr] + '"';

      }
      else if (attr[0] === '[' && attr[1] === '(') {
        // console.log('[(click)]', tag)

      }
      else if (attr[0] === '#') {
        // console.log('#SWAG', attr, tag)
        // tag = tag + attr.replace('[', '').replace(']', '') + '="' + attributes[attr] + '"';

      }
      else if (attr[0] === '*') {
        // console.log('*SWAG', attr, tag)
        // tag = tag + attr.replace('[', '').replace(']', '') + '="' + attributes[attr] + '"';

      }
      else {
        tag = tag + ' ' + attr + ' ';//(attr + '="' + attr + '"');
      }

    }

  }


  return (tag + '>').replace(' >', '>');
}


function closeTag(node) {
  if (!node || !node.name) return '';
  var tag = node.name.toLowerCase();
  return '</' + tag + '>';
}


// hacky way to return the correct string
function logValue(node, type) {
  if (!node) return '';

  try {
    // if view is a tag node return string version
    if (node.type && node.type === 'tag' || node.type === 'style'|| node.type === 'script') {

      if (type === 0) {
        return openTag(node);
      } else if (type === 1) {
        return closeTag(node);
      }

    }
    // if view is a text node return the string
    else if (node.type === 'text') {

      if (node.data && type) return node.data || '';
      // console.log('logValue', node, type);
      return '';

    }
    else {
      // ignore root types <template>
      return '';
    }

  } catch(e) {
    // because I had errors before
    console.log('WAT', e);
  }
}

var tagBlackList = {
  'template': true
}

function isTagBlackList(node) {
  if (!node) return !node;

  if (node.type && node.type === 'tag') {
    return !!tagBlackList[node.name]
  }

  return 0;
}
//
function traverseDom(nodes) {
  if (!nodes) return '';
  // iterate through child nodes
  var newContent = '';
  if (Array.isArray(nodes)) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      // console.log(logValue(node, 0));
      if (!isTagBlackList(node)) {
        newContent += logValue(node, 0);
        if (node.children && node.children.length) {
          newContent += traverseDom(node.children);
        }
        // console.log(logValue(node, 1));
        newContent += logValue(node, 1);
      }
    }
  }
  // if View node is root or leaf
  else if (isObject(nodes)) {

    if (!isTagBlackList(nodes)) {
      newContent += logValue(nodes, 0);
      if (nodes && nodes.children && nodes.children.length) {
        newContent += traverseDom(nodes.children);
      }
      // console.log(logValue(nodes, 1));
      newContent += logValue(nodes, 1);
    }
  }
  // not sure I need this anymore
  else {

    console.log('yup', logValue(nodes));
    newContent += logValue(nodes);
  }
  return newContent;
}

export function ng2string(nodes) {
  var serialized = traverseDom(nodes);
  return serialized;
};
