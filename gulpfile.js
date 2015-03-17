var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var traceur = require('gulp-traceur');

var PATHS = {
  src: {
   client: 'client/*.js',
   es6: 'src/**/*.es6.js',
   html: 'src/**/*.html'
  },
  lib: [
   'node_modules/gulp-traceur/node_modules/traceur/bin/traceur-runtime.js',
   'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
   'node_modules/systemjs/lib/extension-register.js',
   'node_modules/angular2/node_modules/zone.js/zone.js'
  ]
};

gulp.task('clean', function(done) {
  del(['dist'], done);
});

gulp.task('es6', function () {
  gulp.src(PATHS.src.es6)
  .pipe(rename({extname: ''})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
  .pipe(plumber())
  .pipe(traceur({
    modules: 'commonjs',
    moduleName: true,
    annotations: true,
    types: true,
    // asyncFunctions: true,
    // asyncGenerators: true,
    // forOn: true,
    sourceMaps: true
  }))
  .pipe(rename({extname: '.node.es6.js'})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
  .pipe(gulp.dest('dist'));
  return gulp.src(PATHS.src.es6)
    .pipe(rename({extname: ''})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
    .pipe(plumber())
    .pipe(traceur({
      modules: 'instantiate',
      moduleName: true,
      annotations: true,
      types: true,
      // asyncFunctions: true,
      // asyncGenerators: true,
      // forOn: true,
      sourceMaps: true
    }))
    .pipe(rename({extname: '.es6.js'})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
    .pipe(gulp.dest('dist'));
});

gulp.task('html', function () {
  return gulp.src(PATHS.src.html)
    .pipe(gulp.dest('dist'));
});

gulp.task('client', function () {
  return gulp.src(PATHS.src.client)
    .pipe(gulp.dest('dist'));
});

gulp.task('libs', ['angular2'], function () {
  return gulp.src(PATHS.lib)
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('angular2', function () {

  //transpile & concat
  return gulp.src([
      'node_modules/angular2/es6/prod/src/core/compiler/xhr/xhr_impl.es6',
      'node_modules/angular2/es6/prod/*.es6',
      'node_modules/angular2/es6/prod/src/**/*.es6',
      // 'node_modules/angular2/es6/prod/src/**/**/*.es6',
      // 'node_modules/angular2/es6/prod/src/**/**/**/*.es6',
      // 'node_modules/angular2/es6/prod/src/**/**/**/**/*.es6',
      // 'node_modules/angular2/es6/prod/src/**/**/**/**/**/*.es6',
      '!node_modules/angular2/es6/prod/src/test_lib/**',
      '!node_modules/angular2/es6/prod/test_lib.es6'
    ],
      { base: 'node_modules/angular2/es6/prod' }
    )
    .pipe(rename(function(path){
      path.dirname = 'angular2/' + path.dirname; //this is not ideal... but not sure how to change angular's file structure
      path.extname = ''; //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
    }))
    .pipe(traceur({
      modules: 'instantiate',
      moduleName: true,
      // sourceMaps: true
    }))
    .pipe(concat('angular2.js'))
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('rtts_assert', function () {

  //transpile & concat
  return gulp.src([
      'node_modules/rtts_assert/es6/rtts_assert.es6',
      'node_modules/rtts_assert/es6/src/rtts_assert.es6'],
      { base: 'node_modules/rtts_assert/es6' })
    .pipe(rename(function(path){
      path.dirname = 'rtts_assert/' + path.dirname; //this is not ideal... but not sure how to change angular's file structure
      path.extname = ''; //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
    }))
    .pipe(traceur({
      modules: 'instantiate',
      moduleName: true,
      sourceMaps: true
    }))
    .pipe(concat('rtts_assert.js'))
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('play', ['default'], function () {

  // gulp.watch(PATHS.src.html, ['html']);
  gulp.watch(PATHS.src.es6, ['es6']);
  gulp.watch(PATHS.src.client, ['client']);

});

gulp.task('default', ['es6', 'libs', 'client']);
