var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var cleanCss = require('gulp-clean-css');
var concat = require('gulp-concat');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');

var jsFiles = ['dev/js/helper.object.js', 'dev/js/scatterplot-graph.object.js', 'dev/js/bike-race-doping.object.js', 'dev/js/bike-race-doping.app.js'];

gulp.task('default', ['update-html', 'update-scripts', 'update-css'], function() {
  gulp.watch('dev/**/*.html', ['update-html']);
  gulp.watch('dev/js/**/*.js', ['update-scripts']);
  gulp.watch('dev/**/*.css', ['update-css']);
  browserSync.init({
    server: {
      baseDir: './dev'
    }
  });
  browserSync.stream();
});

// Tasks for development

gulp.task('update-html', function() {
  browserSync.reload();
});

gulp.task('update-scripts', function() {
  gulp.src(jsFiles)
    .pipe(concat('scatterplot-graph.js'))
    .pipe(gulp.dest('dev/js'))
    .pipe(browserSync.stream());
});

gulp.task('update-css', function() {
  browserSync.reload();
});

// Tasks for production

gulp.task('create-dist', [
  'to-dist-html',
  'to-dist-css',
  'to-dist-js'
]);

gulp.task('to-dist-html', function() {
  gulp.src('dev/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('to-dist-css', function() {
  gulp.src('dev/css/**/*.css')
    .pipe(autoprefixer({
      browsers: ['last 2 versions', '>0.1%', 'ie >= 8']
    }))
    .pipe(cleanCss({
      compatibility: 'ie8'
    }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('to-dist-js', function() {
  gulp.src(jsFiles)
    .pipe(concat('scatterplot-graph.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});