"use strict";

/** @type {String} Domain for use local server proxy */
var domain = 'my.semantex.ls';

var glob = require('glob');
var browserSync = require("browser-sync");
var gulp = require("gulp");
    gulp.plumber = require("gulp-plumber");
    gulp.debug = require("gulp-debug");
    gulp.autoprefixer = require("gulp-autoprefixer");
    gulp.sass = require("gulp-sass");
    gulp.groupCssMediaQueries = require("gulp-group-css-media-queries");

var webpack = require("webpack"),
    webpack_stream = require("webpack-stream"),
    TerserPlugin = require('terser-webpack-plugin'),
    VueLoaderPlugin = require('vue-loader/lib/plugin');

var path = {
    styles: [
    ],
    scripts: [
        {
            src: './source/',
            dest: './dist/',
        }
    ]
};

const buildStyles = function(done, src, dest) {
    return gulp.src(src, { allowEmpty: true })
        .pipe(gulp.plumber())
        .pipe(gulp.sass({ includePaths: ['node_modules', path.styles.src] }))
        .pipe(gulp.groupCssMediaQueries())
        .pipe(gulp.autoprefixer({ cascade: false, grid: true }))
        .pipe(browserSync.stream())
        .pipe(gulp.plumber.stop())
        .pipe(gulp.dest(dest))
        .pipe(gulp.debug({ "title": "Styles" }))
        .pipe(browserSync.reload({stream: true}));
}

function getEntries(path) {
    var entries = {};
    glob.sync(path.src + '**/*.js').map(function(found) {
        var filename = found.replace(/^.*[\\\/]/, '');
        var folder = found.replace(path.src, '').replace(filename, '');

        if ("_" != filename[0]) {
            entries[path.dest + folder + filename] = found;
        }
    });

    return entries;
}

const buildScripts = function(done, entry) {
    return gulp.src('nonsense', { allowEmpty: true })
        .pipe(webpack_stream({
            entry: entry,
            output: { filename: "[name]" },
            stats: 'errors-only',
            mode: 'development',
            optimization: {
                minimize: true,
                minimizer: [
                    new TerserPlugin({
                        extractComments: false,
                    }),
                ],
            },
            module: {
                rules: [
                {
                    test: /\.js$/,
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime']
                    },
                    exclude: /node_modules/
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.scss$/,
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                }
                ]
            },
            plugins: [
                new VueLoaderPlugin()
            ]
        }), webpack)
        .pipe(gulp.dest('./'))
        .pipe(gulp.debug({ "title": "Script" }))
        .pipe(browserSync.reload({stream: true}));
}

gulp.task('build::styles', function(done) {
    path.styles.forEach(function(el) {
        return buildStyles(done, [el.src + '**/*.scss'], el.dest);
    });

    return done();
});

gulp.task('build::scripts', function(done) {
    return buildScripts(done, path.scripts.reduce(function(acum, obj) {
        return Object.assign(acum, getEntries(obj));
    }, {}));
});

gulp.task('watch', function(done) {
    path.styles.forEach(function(el) {
        gulp.watch(el.src + '**/*.scss', function watchBuildStyles(done) {
            return buildStyles(done, [el.src + '**/*.scss'], el.dest);
        });
    });

    path.scripts.forEach(function(el) {
        gulp.watch(el.src + '**/*.js', function watchBuildScripts(done) {
            return buildScripts(done, getEntries(el));
        });
    });
});

gulp.task('build', gulp.parallel("build::styles", "build::scripts"));

/**
 * Start serve/watcher
 */
gulp.task("default", gulp.parallel("watch", function startServer() {
    browserSync.init({
        tunnel: false,
        port: 9000,
        notify: false,
        proxy: domain
    })
}));