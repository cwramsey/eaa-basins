'use strict';

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const watch = require('gulp-watch');
const ngAnnotate = require('gulp-ng-annotate');
const babel = require('gulp-babel');

gulp.task('build', () => {
    return watch([
        "./app/**/*.js",
        "!./app/bundle.js"
    ], () => {
        console.log("Building");

        gulp.src('./app/**/*.js')
            .pipe(sourcemaps.init())
            .pipe(concat("bundle.js"))
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(ngAnnotate())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./'));

        console.log("Done");
    })
});