
export function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export function showDebug(options, state) {
  return '\n'+
  '<pre>'+
  'Server = ' + JSON.stringify(options, null, 2)+
  '</pre>'+
  '<pre>'+
  '// Component State'+
  'state = ' + JSON.stringify(state, null, 2)+
  '</pre>';
}
