declare var require: any;
declare var __filename: string;
declare var __dirname: string;
declare var global: any;

declare module 'fs' {
  function readFile(filePath: string, callback: Function): any
}
