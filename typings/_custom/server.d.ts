declare module 'fs' {
  function readFile(filePath: string, options = {}, done): any
}

declare module 'angular2/src/render/api' {
  class Renderer {}
  class RenderViewRef {}
  class RenderProtoViewRef {}
}
