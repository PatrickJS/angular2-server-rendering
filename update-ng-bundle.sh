echo ""
echo "updating scripts from code.angularjs.org"

curl -o web_modules/angular2.dev.js "https://code.angularjs.org/$1/angular2.dev.js"
curl -o web_modules/angular2.js "https://code.angularjs.org/$1/angular2.js"
curl -o web_modules/angular2.min.js "https://code.angularjs.org/$1/angular2.min.js"
curl -o web_modules/router.dev.js "https://code.angularjs.org/$1/router.dev.js"
curl -o web_modules/router.dev.js.map "https://code.angularjs.org/$1/router.dev.js.map"

curl -o web_modules/system.js  "https://raw.githubusercontent.com/systemjs/systemjs/$3/dist/system.js"
curl -o web_modules/system.js.map  "https://raw.githubusercontent.com/systemjs/systemjs/$3/dist/system.js.map"
curl -o web_modules/system.src.js  "https://raw.githubusercontent.com/systemjs/systemjs/$3/dist/system.src.js"

curl -o web_modules/Reflect.js  "https://raw.githubusercontent.com/rbuckton/ReflectDecorators/$4/Reflect.js"
curl -o web_modules/Reflect.js.map  "https://raw.githubusercontent.com/rbuckton/ReflectDecorators/$4/Reflect.js.map"

echo "done!"
echo ""
