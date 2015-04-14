var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var traceur = require('gulp-traceur');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');

var PATHS = {
  src: {
   server: 'env/server/*.es6.js',
   client: 'env/client/*.es6.js',
   // server: 'server/*.js',
   iso: 'src/**/*.es6.js',
   html: 'src/**/*.html',
   dist: 'dist',
   dist_client: 'dist/client',
   dist_server: 'dist/server'
  },
  lib: [
   'node_modules/gulp-traceur/node_modules/traceur/bin/traceur-runtime.js',
   'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
   'node_modules/systemjs/lib/extension-cjs.js',
   'node_modules/systemjs/lib/extension-register.js',
   // 'node_modules/rtts_assert/src/rtts_assert.js',
   'node_modules/zone.js/zone.js',
   'node_modules/angular2/node_modules/rx/dist/rx.all.js'
  ]
};

gulp.task('clean', function(done) {
  del([PATHS.src.dist], done);
});


gulp.task('iso.client', function() {
  return gulp.src(PATHS.src.iso, { base: 'src' })
    .pipe(rename({extname: ''})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
    .pipe(plumber())
    .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(traceur({
        modules: 'instantiate',
        moduleName: true,
        annotations: true,
        types: true,
        memberVariables: true,
        experimental: true
        // asyncFunctions: true,
        // asyncGenerators: true,
        // forOn: true
        // sourceMaps: true
      }))
      .pipe(rename({extname: '.es6.js'})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
    .pipe(sourcemaps.write('.', {
      sourceMappingURLPrefix: ''
    }))
    .pipe(gulp.dest(PATHS.src.dist_client));
});

gulp.task('iso.server', function() {
  return gulp.src(PATHS.src.iso, { base: 'src' })
  .pipe(rename({extname: ''})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
  .pipe(plumber())
  .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(traceur({
      modules: 'commonjs',
      moduleName: true,
      annotations: true,
      types: true,
      memberVariables: true,
      experimental: true
      // asyncFunctions: true,
      // asyncGenerators: true,
      // forOn: true
      // sourceMaps: true
    }))
    .pipe(rename({extname: '.es6.js'})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
  .pipe(sourcemaps.write('.', {
    sourceMappingURLPrefix: ''
  }))
  .pipe(gulp.dest(PATHS.src.dist_server));
});

gulp.task('iso', ['iso.client', 'iso.server']);

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
    .pipe(sourcemaps.init({ loadMaps: true }))
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
    .pipe(sourcemaps.write('.', {
      sourceMappingURLPrefix: ''
    }))
    .pipe(gulp.dest(PATHS.src.dist+'/lib'));
});


gulp.task('rtts_assert', function () {
  //transpile & concat
  return gulp.src([
        'node_modules/rtts_assert/es6/src/rtts_assert.es6'
      ],
      { base: 'node_modules/rtts_assert/es6' }
    )
    .pipe(sourcemaps.init({ loadMaps: true }))
      // .pipe(rename(function(path){
      //   path.dirname = 'rtts_assert/' + path.dirname; //this is not ideal... but not sure how to change angular's file structure
      //   path.extname = ''; //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
      // }))
      .pipe(traceur({
        modules: 'inline',
        // sourceMaps: true
      }))
      .pipe(concat('rtts_assert.js'))
    .pipe(sourcemaps.write('.', {
      sourceMappingURLPrefix: ''
    }))
    .pipe(gulp.dest(PATHS.src.dist+'/lib'));
});

gulp.task('angular2.deps', function () {
  return gulp.src(PATHS.lib)
    .pipe(gulp.dest(PATHS.src.dist+'/lib'));
});

gulp.task('html', function () {
  return gulp.src(PATHS.src.html)
    .pipe(gulp.dest(PATHS.src.dist_client));
});

gulp.task('env_build.client', function() {
  return gulp.src(PATHS.src.client)
    .pipe(rename({extname: ''})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
    .pipe(plumber())
    .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(traceur({
        modules: 'inline',
        moduleName: true,
        annotations: true,
        types: true,
        memberVariables: true,
        experimental: true,
        // asyncFunctions: true,
        // asyncGenerators: true,
        forOn: true
        // sourceMaps: true
      }))
      .pipe(rename({extname: '.es6.js'})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
    .pipe(sourcemaps.write('.', {
      sourceMappingURLPrefix: ''
    }))
    .pipe(gulp.dest(PATHS.src.dist_client));
});

gulp.task('env_build.server', function() {
  return gulp.src(PATHS.src.server)
  .pipe(rename({extname: ''})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
  .pipe(plumber())
  .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(traceur({
      modules: 'commonjs',
      moduleName: true,
      annotations: true,
      types: true,
      // asyncFunctions: true,
      // asyncGenerators: true,
      forOn: true
      // sourceMaps: true
    }))
    .pipe(rename({extname: '.es6.js'})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
  .pipe(sourcemaps.write('.', {
    sourceMappingURLPrefix: ''
  }))
  .pipe(gulp.dest(PATHS.src.dist_server));
});


gulp.task('env_build', ['env_build.client', 'env_build.server']);


// gulp.task('rtts_assert', ['rtts_assert.client', 'rtts_assert.server'])


gulp.task('libs', ['angular2', 'rtts_assert', 'angular2.deps']);


gulp.task('watch', ['build'], function () {

  // gulp.watch(PATHS.src.html, ['html']);
  gulp.watch(PATHS.src.iso, ['iso']);
  gulp.watch(PATHS.src.client, ['env_build.client']);
  gulp.watch(PATHS.src.server, ['env_build.server']);

});

gulp.task('build', ['iso', 'libs', 'env_build']);

gulp.task('default', function(cb) {
  runSequence('clean', 'build', 'watch', cb);
});
