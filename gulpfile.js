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
gulp.task('minifyAllAdminCSS', function () {
    return gulp.src(['public/css/*.css', 'public/css/admin/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(concat('admin.css'))
        .pipe(gulp.dest('public/cssmin/admin'))
        .pipe(rename('admin.min.css'))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/cssmin/admin'));
});

gulp.task('minifyAllClientCSS', function () {
    return gulp.src(['public/css/*.css', 'public/css/client/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(concat('client.css'))
        .pipe(gulp.dest('public/cssmin/client'))
        .pipe(rename('client.min.css'))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/cssmin/client'));
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

gulp.task('minifyAdminHomeAppJS', function () {
    return gulp.src('public/angular_assets/adminHomeApp/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('concatenated.js'))
        .pipe(gulp.dest('public/angular_assets/adminHomeAppMin'))
        .pipe(rename('concatenated.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/angular_assets/adminHomeAppMin'));
});

gulp.task('minifyClientHomeAppJS', function () {
    return gulp.src('public/angular_assets/clientHomeApp/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('concatenated.js'))
        .pipe(gulp.dest('public/angular_assets/clientHomeAppMin'))
        .pipe(rename('concatenated.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/angular_assets/clientHomeAppMin'));
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
    gulp.watch('public/css/**/*.css', ['minifyAllAdminCSS', 'minifyAllClientCSS', 'minifyAllIndexCSS']);
    gulp.watch('public/angular_assets/adminHomeApp/**/*.js', ['minifyAdminHomeAppJS']);
    gulp.watch('public/angular_assets/clientHomeApp/**/*.js', ['minifyClientHomeAppJS']);
    gulp.watch('public/angular_assets/indexApp/**/*.js', ['minifyIndexAppJS']);
    gulp.watch('public/imgs/**/*', ['minifyAllImages']);
});

// Default Task
gulp.task('default', ['minifyIndexAppJS', 'minifyAdminHomeAppJS', 'minifyClientHomeAppJS', 'minifyAllAdminCSS', 'minifyAllClientCSS', 'minifyAllIndexCSS', 'minifyAllImages', 'watch']);
