const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

plugins.sass.compiler = require('node-sass');

let fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('./package.json'));

let banner =
    '/*\n' +
    ' * projector.js v' + pkg.version + '\n' +
    ' *\n' +
    ' * Copyright (C) 2019 Samuel Lager\n' +
    ' */\n\n';

function css(){
    return gulp
        .src('core-utils/css/projector.css.sass')
        .pipe(plugins.sass({
            sourceMap: false
        }).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer())
        .pipe(plugins.rename('projector.css'))
        .pipe(plugins.header(banner))
        .pipe(gulp.dest('core-utils/css/'))
        .pipe(plugins.cleanCss())
        .pipe(plugins.rename('projector.min.css'))
        .pipe(plugins.header(banner))
        .pipe(gulp.dest('core-utils/css/'))
        .pipe(plugins.connect.reload());
}

function js(){
    return gulp
        .src('core-utils/js/projector.js')
        .pipe(plugins.jshint({
            curly: false,
            eqeqeq: true,
            globals: {
                head: false,
                module: false,
                console: false,
                unescape: false,
                define: false,
                exports: false,
                require: false
            },
            immed: true,
            latedef: 'nofunc',
            newcap: true,
            noarg: true,
            undef: true,
            eqnull: true,
            esversion: 6,
            expr: true,
            loopfunc: true,
            sub: true,
            browser: true
        }))
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.jshint.reporter('fail'))
        .pipe(plugins.terser())
        .pipe(plugins.rename('projector.min.js'))
        .pipe(plugins.header(banner))
        .pipe(gulp.dest('core-utils/js/'))
        .pipe(plugins.connect.reload());
}

function html(){
    return gulp
        .src('demo.html')
        .pipe(plugins.connect.reload());
}

function watch(){
    plugins.connect.server({
        port: 9000,
        host: 'projector.js.test',
        root: '.',
        index: 'demo.html',
        livereload: true
    });
    gulp.watch('core-utils/js/projector.js', js);
    gulp.watch('core-utils/css/projector.css.sass', css);
    gulp.watch('demo.html', html);
}

exports.default = gulp.parallel(js, css);
exports.js = js;
exports.css = css;
exports.serve = watch;