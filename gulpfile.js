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

gulp.task('minifyAllCSS', function () {
    return gulp.src('public/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(ext_replace('.min.css'))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/cssmin/'));
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
//gulp.task('watch', function () {
//    gulp.watch('public/angular_assets/adminHomeApp/**/*.js', ['minifyAdminHomeAppJS']);
//    gulp.watch('public/css/**/*.css', ['minifyAllCSS']);
//});

// Default Task
gulp.task('default', ['minifyIndexAppJS', 'minifyAdminHomeAppJS', 'minifyClientHomeAppJS', 'minifyAllCSS', 'minifyAllImages']);
//gulp.task('default', ['minifyIndexAppJS', 'minifyAdminHomeAppJS', 'minifyAllCSS', 'watch']);