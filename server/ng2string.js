var _ = require('lodash');
/*

TODO:
clean up angular special bindings [class.] [style.]
clean up angular ref
allow [value] and [checked] bindings
blacklist elements <template>
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

var attrHash = {
  'class': function(value) {
    return value + ' ';
  },
  'id': function(value) {
    return value + '';
  },
  'style': function(value) {
    return value + ' ';
  },
  'for': function(value) {
    return value + '';
  },
  'href': function(value) {
    return value + '';
  }
};

function openTag(node) {
  var attributes = node.attribs;

  var tag = '<'+node.name;

  if (attributes) {
    tag += ' ';

    for (var attr in attributes) {
      if (attrHash[attr]) {
        tag = tag + (attr + '="' + attrHash[attr](attributes[attr], attr, attributes) + '"');
      } else {
        tag = tag + attr + ' ';//(attr + '="' + attr + '"');

      }

    }

  }


  return tag + '>';
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
    if (node.type && node.type === 'tag') {


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

    } else {
      return '';
    }

  } catch(e) {
    // because I had errors before
    console.log('WAT', e);
  }
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
      if (node) {
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
  else if (_.isObject(nodes)) {
    for (var objNode in nodes) {
      // console.log(logValue(objNode, 0));
      if (objNode) {
        newContent += logValue(objNode, 0);
        if (objNode && objNode.children && objNode.children.length) {
          newContent += traverseDom(objNode.children);
        }
        // console.log(logValue(objNode, 1));
        newContent += logValue(objNode, 1);
      }
    }
  }
  // not sure I need this anymore
  else {

    // console.log('yup', logValue(nodes));
    newContent += logValue(nodes);
  }
  return newContent;
}

module.exports = function ng2string(nodes) {
  var serialized = traverseDom(nodes);
  return serialized;
};
