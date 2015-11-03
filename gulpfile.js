var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var rollup = require('gulp-rollup');

gulp.task('build-physijs', function() {
	return gulp.src('src/physijs/index.js')
		.pipe(rollup({
			format: 'umd',
			moduleName: 'physijs'
		}))
		.pipe(rename('physi.js'))
		.pipe(gulp.dest('dist'))
		.pipe(uglify())
		.pipe(rename('physi.min.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('build-worker', function() {
	return gulp.src('src/worker/index.js')
		.pipe(rollup({
			format: 'iife',
			moduleName: 'physijsworker'
		}))
		.pipe(rename('physijs-worker.js'))
		.pipe(gulp.dest('dist'))
		.pipe(uglify())
		.pipe(rename('physijs-worker.min.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('build', ['build-physijs', 'build-worker']);