let mix = require('laravel-mix');
require('laravel-mix-clean');

const distDir = 'dist';

mix
    .minify('js/app.js', distDir+'/js/app.js')
    .minify('css/app.css', distDir+'/css/app.css')
    .copy('js/bootstrap.bundle.min.js', distDir+'/js/bootstrap.bundle.min.js')
    .copy('css/bootstrap*.min.css', distDir+'/css')
    .copy('index.html', distDir)
    .sourceMaps()
    .clean()
    .setPublicPath(distDir);
