var browserSync = require('browser-sync').create();
var cache = require('gulp-cache');
var del = require('del');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var minifyHtml = require('gulp-html-minify');
var nano = require('cssnano');
var postcss = require('gulp-postcss');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var gzip = require('gulp-gzip');
var sourcemaps = require('gulp-sourcemaps');

// Copy all files at the root level (app)
gulp.task('copy', function() {
  return gulp.src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  })
  .pipe(gzip({ gzipOptions: { level: 9 } , append: false}))
  .pipe(gulp.dest('dist'));
});

// Copy fonts
gulp.task('fonts', function() {
  return gulp.src([
    'app/styles/*.eot',
    'app/styles/*.svg',
    'app/styles/*.ttf',
    'app/styles/*.woff'
  ])
  .pipe(gzip({ gzipOptions: { level: 9 } , append: false}))
  .pipe(gulp.dest('dist/styles'));
});

// Optimize images
gulp.task('images', function() {
  return gulp.src('app/images/**/*')
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gzip({ gzipOptions: { level: 9 } , append: false}))
    .pipe(gulp.dest('dist/images'));
});

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe(gulpIf('*.html', minifyHtml()))
    .pipe(gzip({ gzipOptions: { level: 9 } , append: false}))
    .pipe(gulp.dest('dist'));
});

// Static Server + watching html/sass files
gulp.task('serve', ['styles'], function() {
  browserSync.init({
    server: ['.tmp', 'app'],
    port: 3000
  });

  // watch files
  gulp.watch(['app/**/*.html'], browserSync.reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', browserSync.reload]);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('styles', function() {
  return gulp.src("app/styles/**/*.scss")
      .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(gulp.dest(".tmp/styles"))
      .pipe(postcss([nano]))
      .pipe(sourcemaps.write('.'))
      .pipe(gzip({ gzipOptions: { level: 9 } , append: false}))
      .pipe(gulp.dest('dist/styles'));
});

// Clean output directory
gulp.task('clean', function() {
  del(['.tmp/*', 'dist/*', '!dist/.git'], {dot: true});
});

// default build dist folder
gulp.task('default', ['clean'], function(callback) {
  runSequence(
    'styles',
    ['html', 'copy', 'fonts', 'images'],
    callback
  );
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  browserSync.init({
    notify: false,
    logPrefix: 'WSK',
    server: 'dist',
    port: 3001
  });
});
