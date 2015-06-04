// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var ext_replace = require('gulp-ext-replace');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

// Concatenate & Minify JS
gulp.task('minifyAllMainCSS', function () {
    return gulp.src(['public/css/*.css', 'public/css/main/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('public/cssmin/main'))
        .pipe(rename('main.min.css'))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/cssmin/main'));
});

gulp.task('minifyAllIndexCSS', function () {
    return gulp.src(['public/css/*.css', 'public/css/index/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(concat('index.css'))
        .pipe(gulp.dest('public/cssmin/index'))
        .pipe(rename('index.min.css'))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/cssmin/index'));
});

gulp.task('minifyMainAppJS', function () {
    return gulp.src('public/angular_assets/aMainApp/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('concatenated.js'))
        .pipe(gulp.dest('public/angular_assets/aMainAppMin'))
        .pipe(rename('concatenated.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/angular_assets/aMainAppMin'));
});

gulp.task('minifyIndexAppJS', function () {
    return gulp.src('public/angular_assets/indexApp/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('concatenated.js'))
        .pipe(gulp.dest('public/angular_assets/indexAppMin'))
        .pipe(rename('concatenated.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/angular_assets/indexAppMin'));
});

gulp.task('minifyAllImages', function () {
    return gulp.src('public/imgs/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('public/imgsmin'));
});

// Watch Files For Changes
gulp.task('watch', function () {
    gulp.watch('public/css/**/*.css', ['minifyAllMainCSS', 'minifyAllIndexCSS']);
    gulp.watch('public/angular_assets/amainApp/**/*.js', ['minifyMainAppJS']);
    gulp.watch('public/angular_assets/indexApp/**/*.js', ['minifyIndexAppJS']);
    gulp.watch('public/imgs/**/*', ['minifyAllImages']);
});

// Default Task
gulp.task('default', ['minifyIndexAppJS', 'minifyMainAppJS', 'minifyAllMainCSS', 'minifyAllIndexCSS', 'minifyAllImages', 'watch']);
