
export function escapeRegExp(str): string {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export function stringify(obj, replacer = null, spaces = 2): string {
  return JSON.stringify(obj, replacer, spaces);
}

export function showDebug(options = {}): string {
  var info = '\n';
  for (var prop in options) {
    if (prop && options[prop]) {
      info += ''+
      '<pre>' +
      `${prop} = ${stringify(options[prop])}` +
      '</pre>';
    }
  }
  return info;
}


export function getHostElementRef(appRef): any {
  return appRef._hostComponent.location.domElement;
}


export function selectorRegExpFactory(selector: string): RegExp {
  // <app></app>
  let intro =  '<' + selector + '>';
  let outro = '</' + selector + '>';
  let appCmp = intro + outro;
  let regExpSelector = new RegExp(escapeRegExp(appCmp), 'g');
  return regExpSelector;
}
