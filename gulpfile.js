var gulp = require('gulp');
var preboot = require('preboot');

gulp.task('preboot', function () {
  return preboot.getClientCodeStream({
    focus:          true,
    keyPress:       true,
    buttonPress:    true,
    replay:         'rerender',
    serverRoot:     'app',
    clientRoot:     'app'
  })
    .pipe(gulp.dest('web_modules'));
});
