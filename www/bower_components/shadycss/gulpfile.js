/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

/* eslint-env node */
/* eslint-disable no-console */

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var rename = require('gulp-rename');
var rollup = require('rollup-stream');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var closure = require('google-closure-compiler').gulp();
var size = require('gulp-size');
var runseq = require('run-sequence');

var modules = ['css-parse', 'custom-style-element', 'make-element', 'svg-in-shadow', 'style-util', 'style-transformer', 'style-settings'];

var moduleTasks = modules.map(function (m) {
  gulp.task('test-module-' + m, function () {
    return rollup({
      entry: 'tests/module/' + m + '.js',
      format: 'iife',
      moduleName: m.replace(/-/g, '_')
    }).pipe(source(m + '.js', 'tests/module')).pipe(gulp.dest('./tests/module/generated'));
  });
  return 'test-module-' + m;
});

gulp.task('clean-test-modules', function () {
  return del(['tests/module/generated']);
});

gulp.task('test-modules', function (cb) {
  runseq('clean-test-modules', moduleTasks, cb);
});

function closurify(entry) {
  gulp.task('closure-' + entry, function () {
    return gulp.src(['src/*.js', 'entrypoints/*.js'], { base: './' }).pipe(sourcemaps.init()).pipe(closure({
      compilation_level: 'ADVANCED',
      language_in: 'ES6_STRICT',
      language_out: 'ES5_STRICT',
      isolation_mode: 'IIFE',
      assume_function_wrapper: true,
      js_output_file: entry + '.min.js',
      entry_point: './entrypoints/' + entry + '.js',
      dependency_mode: 'STRICT',
      warning_level: 'VERBOSE',
      rewrite_polyfills: false,
      externs: 'externs/shadycss-externs.js'
    })).pipe(size({ showFiles: true, showTotal: false, gzip: true })).pipe(sourcemaps.write('.')).pipe(gulp.dest('.'));
  });
  return 'closure-' + entry;
}

function debugify(entry) {
  gulp.task('debug-' + entry, function () {
    return rollup({
      entry: 'entrypoints/' + entry + '.js',
      format: 'iife',
      moduleName: ('' + entry).replace(/-/g, '_')
    }).pipe(source(entry + '.js', 'entrypoints')).pipe(buffer()).pipe(sourcemaps.init({ loadMaps: true })).pipe(rename(entry + '.min.js')).pipe(size({ showFiles: true, showTotal: false, gzip: true })).pipe(gulp.dest('./'));
  });
  return 'debug-' + entry;
}

var entrypoints = ['scoping-shim', 'apply-shim', 'custom-style-interface'];

var closureTasks = entrypoints.map(function (e) {
  return closurify(e);
});
var debugTasks = entrypoints.map(function (e) {
  return debugify(e);
});

gulp.task('default', ['closure', 'test-modules']);

gulp.task('closure', function (cb) {
  runseq.apply(null, closureTasks.concat(cb));
});

gulp.task('debug', debugTasks);