echo ""
echo "updating scripts from code.angularjs.org"

curl -o web_modules/angular2.dev.js "https://code.angularjs.org/$1/angular2.dev.js"
curl -o web_modules/angular2.js "https://code.angularjs.org/$1/angular2.js"
curl -o web_modules/angular2.min.js "https://code.angularjs.org/$1/angular2.min.js"
curl -o web_modules/router.dev.js "https://code.angularjs.org/$1/router.dev.js"
curl -o web_modules/router.dev.js.map "https://code.angularjs.org/$1/router.dev.js.map"

echo "done!"
echo ""
