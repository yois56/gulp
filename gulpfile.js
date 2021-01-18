'use strict';

var gulp = require('gulp'),
	scss = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	//removeEmptyLines = require('gulp-remove-empty-lines'),
	cleanCSS = require('gulp-clean-css'),
	concat = require('gulp-concat'),
	rename = require("gulp-rename"),
	uglify = require('gulp-uglify'),
	fileinclude = require('gulp-file-include'),
	beautify = require('gulp-beautify'),
	del = require('del'),
	sourcemaps = require('gulp-sourcemaps'),
	browserSync = require('browser-sync').create();

var paths = {
	src: {
		root: 'src/',
		scss: 'src/assets/scss/',
		css: 'src/assets/css/',
		js: 'src/assets/js/',
		imgs: 'src/assets/images/',
		html: 'src/html/'
	},
	dest: { // destination
		root: 'dist/',
		css: 'dist/assets/css/',
		js: 'dist/assets/js/',
		imgs: 'dist/assets/images/',
		html: 'dist/html/'
	}
}

var scssOption = {
	'outputStyle': "expanded", // nested, expanded, compact, compressed
	'indentType': "tab", // space, tab
	'indentWidth': 1,
	'precision': 4
};

var beautifyOptionHTML = {
	'indent_size': 4,
	'indent_with_tabs': true
}

gulp.task('scss:compile', function() {
	return gulp.src(paths.src.scss+'**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(scss(scssOption).on('error', scss.logError))
		.pipe(autoprefixer(["> 0.5%, last 2 versions", "Firefox ESR", "Android >= 4", "iOS >= 8", "ie >= 9"]))
		.pipe(gulp.dest(paths.dest.css))
		.pipe(cleanCSS({compatibility:'ie9'})) // minify CSS
		.pipe(rename({suffix:'.min'})) // minify CSS - rename
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.dest.css))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('css', function() {
	return gulp.src([
			paths.src.css+'**/*.css',
			'!'+paths.src.css+'libs/uilibs_bundle/*.css' // ignore
		])
		.pipe(gulp.dest(paths.dest.css))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('css:combine', function() { // 공통 라이브러리 파일들 uilibs.css 로 병합
	return gulp.src(paths.src.css+'libs/uilibs_bundle/*.css')
		.pipe(sourcemaps.init())
		.pipe(concat('uilibs.css'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.dest.css+'libs/'))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('js', function() {
	return gulp.src([
		paths.src.js+'**/*.js',
		'!'+paths.src.js+'libs/uilibs_bundle/*.js' // ignore
		])
		.pipe(gulp.dest(paths.dest.js))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('js:combine', function() { // 공통 라이브러리 파일들 uilibs.js 로 병합
	return gulp.src(paths.src.js+'libs/uilibs_bundle/*.js')
		.pipe(sourcemaps.init())
		.pipe(concat('uilibs.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.dest.js+'libs/'))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('js:uglify', function() {
	return gulp.src(paths.src.js+'common_ui.js')
		.pipe(sourcemaps.init())
		.pipe(gulp.dest(paths.dest.js))
		.pipe(uglify()) // minify JS
		.pipe(rename({suffix:'.min'})) // minify JS - rename
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.dest.js))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('imgs', function() {
	return gulp.src(paths.src.imgs+'**/*.*')
		.pipe(gulp.dest(paths.dest.imgs))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('html', function() {
	return gulp.src(paths.src.root+'*.html')
		.pipe(gulp.dest(paths.dest.root))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('html-pages', function() {
	return gulp.src([
			paths.src.html+'**/*.html',
			'!'+paths.src.html+'_include/*.html' // ignore
		])
		.pipe(fileinclude({
			prefix: '@@',
			basepath: paths.src.html // @file, @root, path/to/dir
		}))
		.pipe(beautify.html(beautifyOptionHTML))
		.pipe(gulp.dest(paths.dest.html))
		.pipe(browserSync.reload({stream:true}));
});

gulp.task('watch', function() {
	gulp.watch(paths.src.scss+'**/*.scss', gulp.series(['scss:compile']));
	gulp.watch(paths.src.css+'**/*.css', gulp.series(['css', 'css:combine']));
	gulp.watch(paths.src.js+'**/*.js', gulp.series(['js', 'js:combine', 'js:uglify']));
	gulp.watch(paths.src.imgs+'**/*.*', gulp.series(['imgs']));
	gulp.watch(paths.src.root+'*.html', gulp.series(['html']));
	gulp.watch(paths.src.html+'**/*.html', gulp.series(['html-pages']));
});

gulp.task('browserSync', gulp.parallel([
		'scss:compile',
		'css', 'css:combine',
		'js', 'js:combine', 'js:uglify',
		'imgs',
		'html', 'html-pages'
	], function() {
		browserSync.init({
			//port : 3333,
			server: {
				baseDir: paths.dest.root,
				index: 'html/sample.html'
			}
		})
	})
);

gulp.task('clean', function() {
	return del.sync(paths.dest.root+'*');
});
	
gulp.task('default', gulp.parallel('clean', gulp.series([
		'scss:compile',
		'css', 'css:combine',
		'js', 'js:combine', 'js:uglify',
		'imgs',
		'html', 'html-pages'
	]), 'watch', 'browserSync')
);