var browserSync = require('browser-sync').create();
var del = require('del');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var minifyHtml = require('gulp-html-minify');
var nano = require('cssnano');
var postcss = require('gulp-postcss');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

// Copy all files at the root level (app)
gulp.task('copy', function() {
  return gulp.src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

// Scan your HTML for assets & optimize them
gulp.task('html', () => {
  return gulp.src('app/**/*.html')
    .pipe(gulpIf('*.html', minifyHtml()))
    .pipe(gulp.dest('dist'));
});

// Static Server + watching html/sass files
gulp.task('serve', ['styles'], function() {
    browserSync.init({
      server: ['.tmp', 'app'],
      port: 3000
    });

    // watch files
    gulp.watch("app/*.html").on('change', browserSync.reload);
    gulp.watch("app/styles/**/*.scss").on('change', ['styles', browserSync.reload]);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('styles', ['vendor-styles'], function() {
    return gulp.src("app/styles/**/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(gulp.dest(".tmp/styles"))
        .pipe(postcss([nano]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/styles'));
});

// compile vendor styles.
gulp.task('vendor-styles', function() {
    return gulp.src("bower_components/Skeleton-Sass/scss/skeleton.scss")
        .pipe(sass())
        .pipe(gulp.dest(".tmp/styles"))
        .pipe(postcss([nano]))
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
    ['html', 'copy'],
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
