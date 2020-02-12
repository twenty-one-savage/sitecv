/**
 * Gulp file для формирования шаблонов под CMS MODx с использованием шаблонизатора Fenom.
 *
 * При запуске с параметром --dev=0 формируется production версия. Папка config
 * содержит в себе основные параметры которые используются в шаблонизаторе и могут
 * перезаписывать друг друга если имена парaметров совпадают.
 *
 * @param string $manifest(def: 1) принудительное управление манифестом, суффикс добавляемый к именам файлов
 * @param string $watch (def:1) открывает браузер, включает слежку за файлами
 * @param string $show_log (def: 0) отображает лог в консоли, иначе скидывает в logs
 * @param string $dev(def: 1) developer версия, включает минификацию итд
 *
 * @author Prishepenko Stepan: Setest <itman116@gmail.com>
 * @package gulp.bp
 * @date  2019.05.15
 * @version 1.0.16
 */

const {
  lastRun,
  watch,
  task,
  src,
  dest,
  series,
  parallel
} = require('gulp');
const fs = require('fs'),
  path = require('path'),
  del = require('del'),
  glob = require('glob'),
  // cjson = require('cjson'),
  babel = require('gulp-babel'),
  // bundle = require('gulp-bundle-assets'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'), //
  stylus = require('gulp-stylus'),

  svgSprite = require('gulp-svg-sprite'),
  svgmin = require('gulp-svgmin'),
  cheerio = require('gulp-cheerio'),

  spritesmith = require('gulp.spritesmith'),
  imagemin = require('gulp-imagemin'),

  concat = require('gulp-concat'),
  rename = require('gulp-rename'),
  // cssnano = require('gulp-nano'), // сжимает css
  cleanCSS = require('gulp-clean-css'),

  cached = require('gulp-cached'),
  gulpif = require('gulp-if'),

  notify = require('gulp-notify'), // https://www.npmjs.com/package/gulp-notify
  newer = require('gulp-newer'),
  // rigger = require('gulp-rigger'),
  // pagebuilder = require('gulp-pagebuilder'),
  // fileinclude = require('gulp-file-include'),
  // gulpCopy = require('gulp-copy'),
  through = require("through2"),

  uglify = require('gulp-uglify'),
  pump = require('pump'),
  replace = require('gulp-replace'),

  // tap = require('gulp-tap'),

  // nunjucks = require('nunjucks'),
  nunjucks = require('nunjucks'),
  nunjucks_gulp = require('gulp-nunjucks'),

  rev = require('gulp-rev'),
  revRewrite = require('gulp-rev-rewrite'),
  // revDel = require('rev-del'),
  // revCollector = require('gulp-rev-collector'),


  // для iconfont
  iconfont = require('gulp-iconfont'),
  iconfontCss = require('gulp-iconfont-css'),

  // обработка изображений
  webp = require('gulp-webp'),


  combine = require('stream-combiner2').obj, // позволяет последовательно выполнять несколько функций переданных в один pipe

  browserSync = require('browser-sync').create(),

  // objectAssign = require('object-assign'),
  // _ = require('lodash'), // !!! очень круто https://lodash.com/docs/4.17.11 типа underscore
  _merge = require('lodash.merge'),

  debug = require('gulp-debug'),
  loggerMod = require('./logger'),
  logger = loggerMod.getLogger(),

  gzip = require('gulp-gzip'),

  shell = require('shelljs'),

  gulpConfig = require('./gulp-config')

// confirm = require('gulp-confirm')
// remember = require('gulp-remember'),
;

var argv = require('minimist')(process.argv.slice(2));
// console.log(argv);
const isDevelopment = !!((argv.dev === undefined || argv.dev) || process.env.NODE_ENV == 'development');
const isWatch = !!(argv.watch === undefined || !!argv.watch);
const hasManifest = (argv.hasOwnProperty('manifest') ? !!argv.manifest : !isDevelopment);
const domain = (argv.hasOwnProperty('domain') ? argv.domain : 'web');
const project = (argv.hasOwnProperty('project') ? argv.project : '');

if (!!(argv.show_log !== undefined && !!argv.show_log)) {
  // отображаем лог в консоли
  loggerMod.showLog();
  // gulpConfig.loggerMod.showLog();
}

gulpConfig.initialize({
  'domain': domain
});

const config = gulpConfig.get_config('config');
// console.log(config);
const vendors_config = gulpConfig.vendors;
// const vendors_config = cjson.load('src/vendors/vendors.json');

// const isWatch = argv.watch === undefined;
logger.info('Режим isDevelopment == ', isDevelopment);
logger.info('Режим isWatch == ', isWatch);
// logger.info('pwd1 ', process.cwd());
// logger.info('pwd2 ', __dirname);
// logger.info('pwd3 ', path.dirname(require.main.filename));
logger.info('pwd4 ', path.dirname(process.mainModule.filename));
// pwd1  /run/media/setest/MiniSet2/Работа/DIF/shop.bp/template
// pwd2  /run/media/setest/MiniSet2/Работа/DIF/shop.bp/template
// pwd3  /usr/lib/node_modules/gulp-cli/bin
// pwd4  /usr/lib/node_modules/gulp-cli/bin


// return;
// const isDevelopment = !argv||dev;


// var log = logger.info.bind(console);
// reload = browserSync.reload;

logger.info('vendors', vendors_config);

// const uglify = require('gulp-uglify');

const clean = function (cb) {
  logger.info('Очищаем папки')
  // return del([
  del([
      'dist/**/*',
      'tmp/**/*',
    ])
    .then(paths => {
      logger.info('Deleted files and folders:\n', paths.join('\n'));
      cb();
    }).catch(error => {
      logger.error('Ошибка очистки: ', error.message);
      // console.error('uhoh', error);
      // return true;
    });
};
clean.displayName = 'clean';
task(clean);


const attention = function (msg) {
  msg = msg ||
    `\n================================\nНажмите клавишу для продолжения!\n================================`;
  logger.info(msg)
  var fd = fs.openSync("/dev/stdin", "rs")
  fs.readSync(fd, new Buffer(1), 0, 1)
  fs.closeSync(fd)
};
attention.displayName = 'attention';

////////////////////////////////////////////////////////////////////
// Подготовка SVG
// используемые материалы:
// https://dbushell.com/demos/svg/2015-01-29/svg-sprite.html !!!!!!!!!!!!! ПРИМЕР всех вариантов
// http://dreamhelg.ru/2017/02/symbol-svg-sprite-detail-guide/
// https://modx.ws/svg-sprites-gulp-sass
// https://codepen.io/jennhi/post/using-svg-symbols-as-css-backgrounds
// https://cdn.rawgit.com/jennifer-hiller/resources/master/svg-defs-apis-admins-corrected.svg файл в symbol
// https://habr.com/ru/post/272505/ практический опыт на примере jade и sass
// https://osvaldas.info/caching-svg-sprite-in-localstorage скрипт подмены svg в случае отказа браузера
// https://tympanus.net/codrops/2015/07/16/styling-svg-use-content-css/ про виды svg их оформление
// http://prgssr.ru/development/oformlenie-soderzhimogo-use-v-svg-s-pomoshyu-css.html тоже на русском
// https://css-tricks.com/svg-symbol-good-choice-icons/
// https://codepen.io/noahblon/post/coloring-svgs-in-css-background-images
// https://github.com/jkphl/svg-sprite/blob/master/docs/configuration.md
// https://github.com/jkphl/svg-sprite/blob/master/docs/templating.md
// https://tomhazledine.com/inline-svg-icon-sprites/
// https://habr.com/ru/post/227945/
// https://habr.com/ru/post/276463/
// http://glivera-team.github.io/svg/2016/06/13/svg-sprites-2.html
// https://stackoverflow.com/questions/13367868/modify-svg-fill-color-when-being-served-as-background-image
// https://github.com/glivera-team/glivera-team-template полная сборка какогото проекта
// https://github.com/jonathantneal/svg4everybody
////////////////////////////////////////////////////////////////////

// task('sprites:svg_font', series('clean', function () {
task('sprites:svg_font', series(function () {
  // return src(['./src/images/_sprites/**/*.svg'])
  return src(['./src/' + domain + '/images/_fonts/**/*.svg'])
    .pipe(through.obj((file, enc, cb) => {
      // заменим все / на - в относительном пути, что бы логика со спрайтами svg была одинаковой
      // var file = {
      //   "relative": "super / deep / icon / menu.svg"
      // };
      // console.log('file 1', file.relative);
      // в виндовс разные пути в relative и basepath поэтому с заменой нужно быть внимательнее
      file.basename = file.relative.replace(new RegExp('[/|\\\\]', 'g'), '-');
      // console.log('file 2', file.basename);

      cb(null, file)
    }))
    .pipe(iconfontCss({
      // engine: 'lodash', // default https://github.com/lodash/lodash/tree/4.17.11-npm
      fontName: config.svgFont.fontName,
      path: config.svgFont.css_template,
      targetPath: config.svgFont.targetPath,
      fontPath: config.svgFont.fontPath,
      cssClass: 'i'
    }))
    .pipe(iconfont({
      fontName: config.svgFont.fontName,
      normalize: true,
      fontHeight: 1001,
      formats: ['ttf', 'eot', 'woff', 'woff2', 'svg']
    }))
    .pipe(dest(config.svgFont.fontPath));
  // .pipe(dest('./src/fonts/'));
}));

// task('sprites:png', series('clean', function () {
task('sprites:png', series(function () {
  // var spriteData = src('./src/images/**/*.png',)
  return src([
      './src/' + domain + '/images/_sprites/**/*.png',
    ], {
      base: 'src/' + domain + '/images/_sprites/',
      // since:lastRun('sprites:png')
    })
    .pipe(newer('sprites:png'))
    .pipe(imagemin([
      // imagemin.gifsicle({interlaced: true}),
      // imagemin.jpegtran({progressive: true}),
      // imagemin.svgo({
      //   plugins: [
      //     {removeViewBox: true},
      //     {cleanupIDs: false}
      //   ]
      // })
      imagemin.optipng({
        // https://github.com/imagemin/imagemin-optipng
        optimizationLevel: 3 // 0(nothing)-7
      }),
    ]))
    .pipe(through.obj((file, enc, cb) => {
      // заменим все / на - в относительном пути, что бы логика со спрайтами svg была одинаковой
      file.basename = file.relative.replace(new RegExp('/', 'g'), '-');
      cb(null, file)
    }))
    // TODO: в это месте вставить разбор пути к файлу чтобы icon/arrow/left.png -> icon-arrow-left.png
    .pipe(spritesmith({
      // cssFormat: 'stylus', // css,json,stylus...
      // algorithm: 'alt-diagonal'
      // retinaSrcFilter: ['images/*@2x.png'],
      // retinaImgName: 'sprite@2x.png',
      imgName: config.pngSprite.imgName,
      cssName: config.pngSprite.cssName,
      padding: 20, // Exaggerated for visibility, normal usage is 1 or 2
      cssTemplate: config.pngSprite.cssTemplates.stylus, // https://github.com/twolfson/spritesheet-templates#css
      cssHandlebarsHelpers: config.pngSprite.cssHandlebarsHelpers,
    }))
    .pipe(dest(config.target_path__assets));
}));

task('sprites:svg', series(function () {
  // task('sprites:svg', series('clean', function () {
  return src([
      './src/' + domain + '/images/_sprites/**/*.svg',
    ], {
      base: 'src/' + domain + '/images/_sprites/',
      since: lastRun('sprites:svg') // срабатывает только при втором запуске череp watch (инкрементальная сборка)
      // либо при первом в обычной сборке
    })
    // .pipe(newer('sprites:svg'))
    // .pipe(plumber())

    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))

    // remove all fill, style and stroke declarations in out shapes
    .pipe(cheerio({
      // run: function ($) {
      run: function () {
        /*$('[fill]').removeAttr('fill'); // убирает все цвета
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');*/
      },
      parserOptions: {
        xmlMode: true
      }
    }))

    // cheerio plugin create unnecessary string '&gt;', so replace it.
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite(config.svgSprite))
    .on('error', function (error) {
      logger.error('create svg sprite error: ', error);
      /* Do some awesome error handling ... */
    })

    // необходимо добавить теги use в результирующий svg
    .pipe(cheerio({
      run: function ($) {
        var symbols = [];
        var views = [];
        // var masks = [];
        var $that = $(this);
        $('symbol').each(function (i, elem) {
          let id = $(this).attr('id');
          const height = 32;
          if ($("use#" + id, $that).length == 0) {
            // по идее не обязательная проверка
            // symbols[i] = '<use xlink:href="#' + id + '" id="' + id + '"></use>';
            symbols[i] = '<use xlink:href="#' + id + '" id="' + id + '" width="32" height="32" x="0" y="' + (height * i) + '"></use>';
            views[i] = '<view id="' + id + '-view" viewBox="0 ' + (height * i) + ' 32 32"/>';
            // masks[i] = '<mask id="' + id + '-mask">' + symbols[i] + '</mask>';
          }
        });

        // <mask id="mask-circles">
        //             <use xlink:href="#s-mask-circles" />
        //         </mask>
        // <view id="shape-apis-view" viewBox="0 0 35 35" />
        // <use xlink:href="#shape-apis" width="35" height="35" x="0" y="0" id="shape-apis"></use>

        let views_result = views.join("\n");
        let symbols_result = symbols.join("\n");
        // let masks_result = masks.join("\n");
        $(views_result).appendTo('svg');
        // $(masks_result).appendTo('svg');
        $(symbols_result).appendTo('svg');
        // logger.info($.html());
      },
      // опции парсинга обязательны иначе вставка происходит не верно
      parserOptions: {
        withDomLvl1: true,
        normalizeWhitespace: false,
        xmlMode: true,
        decodeEntities: false
      }
    }))
    .pipe(replace('&gt;', '>'))

    .pipe(dest(config.target_path__assets));
  // .pipe(dest(config.base_path));
  // .pipe(dest('zzz'));
}));

task('assets', function () {
  return src([
      './src/' + domain + '/**',
      '!src/' + domain + '/**/_*/', //exclude folders starting with '_'
      '!src/' + domain + '/**/_*/**/*', //exclude files/subfolders in folders
      // '!./src/' + domain + '/images/**',
      '!./src/' + domain + '/**/vendors/**',
      '!./src/' + domain + '/**/css/**',
      '!./src/' + domain + '/**/js/**',
      '!./src/' + domain + '/**/templates/**'
    ], {
      base: 'src/' + domain + '/',
      since: lastRun('assets') // срабатывает только при втором запуске череp watch (инкрементальная сборка)
      // либо при первом в обычной сборке
    })
    .pipe(through.obj((file, enc, cb) => {
      if (file.isDirectory && (new RegExp('^_').test(file.basename))) {
        logger.warn('не копируем директорию!!!', file.basename);
        cb();
        return;
      }
      cb(null, file)
    }))
    //
    // .pipe(debug({'title':'[assets] before newer'}))
    .pipe(newer('dist')) // после newer лучше сжимать изображения, тогда это делается один раз
    // .pipe(debug({'title':'[assets] insert into dist'}))
    .pipe(dest(config.target_path__assets));
});


task('images', series(function () {
  // https: //habr.com/ru/post/422531/#04
  return src([
      `${config.target_path__assets_full}images/**/*.{jpg,png}`,
      // 'src/images/*.{jpg,png}',
      // 'src/images/**/*.{jpg,png}',
      // '!src/images/**/_*/', //exclude folders starting with '_'
      // '!src/images/**/_*/**/*', //exclude files/subfolders in folders
    ], {
      // base: 'src/',
      base: config.target_path__assets_full,
    })
    // Настройки по умолчанию WebP - m 4 - q 75 хороши для большинства случаев как оптимальное соотношение скорости и степени сжатия.
    // У WebP есть специальный режим сжатия без потерь(-m 6 - q 100), который уменьшает файлы, изучив все сочетания параметров.Это на порядок медленнее, но стоит того для статических ресурсов.
    .pipe(newer('images'))
    .pipe(rename(function (file) {
      file.basename = `${file.basename}${file.extname}`;
    }))
    .pipe(webp({
      method: 4,
      quality: 75
    }))
    // .pipe(imagemin([
    // imagemin.gifsicle({interlaced: true}),
    // imagemin.jpegtran({progressive: true}),
    // imagemin.svgo({
    //   plugins: [
    //     {removeViewBox: true},
    //     {cleanupIDs: false}
    //   ]
    // })
    // imagemin.optipng({
    // https://github.com/imagemin/imagemin-optipng
    // optimizationLevel: 3 // 0(nothing)-7
    // }),
    // ]))
    .pipe(dest(config.target_path__assets));
}));


task('stylus', function (done) {
  let target_path = config.target_path__assets + 'css';
  return src(['tmp/css/**.{css,styl}', './src/' + domain + '/css/**/*.css', './src/' + domain + '/css/*.styl'], // строгая последовательность
    )
    .pipe(rename(function (file) {
      if (file.extname == '.styl') {
        file.basename += ".stylus";
      }
    }))

    .pipe(debug({
      'title': 'sourcemaps'
    }))
    .pipe(gulpif(isDevelopment, sourcemaps.init()))
    .pipe(gulpif(function (file) {
      return (file.extname == '.styl') ? true : false;
    }, stylus({
      compress: !isDevelopment,
      'include css': true
    })))
    .on('error', notify.onError(function (err) {
      return {
        title: 'Stylus',
        message: err.message
      }
    }))
    .pipe(gulpif(isDevelopment, sourcemaps.write()))
    .pipe(gulpif(isDevelopment, dest(target_path + '/source/')))

    .pipe(concat('style.css'))
    .pipe(autoprefixer())
    .pipe(gulpif(hasManifest, rev()))
    .pipe(dest(target_path))
    .pipe(gulpif(!isDevelopment, combine(rev.manifest('tmp/manifest/development.json', {
      base: 'tmp/manifest',
      merge: true
    }), dest('./tmp/manifest'))))
    .pipe(browserSync.stream())
    .pipe(debug());
})

/*
 * Создает итоговые файлы js и css склеивая
 * vendors с css и js указанные в файле development.json.
 */
task('combine_production', function (done) {
  if (isDevelopment) return done();
  // return done();

  let target_path = config.target_path__assets;
  let manifest = {};
  try {
    manifest = require('./tmp/manifest/development.json');
  } catch (e) {}

  logger.info('manifest', manifest)

  // let excepts = 'prod.js|prod.css|prod.min.css|prod.min.js|scripts.js|style.css';
  let excepts = 'scripts.js|style.css';
  if (manifest && typeof manifest == "object") {
    let rev_name = [];

    for (var name in manifest) {
      logger.info('manifest[name]: ' + name)
      rev_name.push(manifest[name]);
    }
    logger.info('rev_name', rev_name);
    excepts = rev_name.join('|')
  }
  excepts = (excepts.length) ? excepts : 'scripts.js|style.css';
  logger.info('excepts: ' + excepts);

  let manifest_parts = ['css', 'js'];
  manifest_parts.forEach(function (part, i) {
    logger.warn('args: ', arguments);
    let target_part_path = target_path + part;

    // let sources = [target_part_path + '/**/!(scripts-c3d88b72fe.js|all-f04c545e28.css)'];
    let sources = [target_part_path + '/**/' + (excepts.length ? '!(' + excepts + ')' : '*')];
    // logger.info('excepts',excepts);
    logger.info('sources: ' + sources);

    // let project_name = project ? '_' + project : '';
    let project_name = project ? '_' + project : '';

    // let pipeLine =
    src(sources, {
        base: target_part_path,
        // debug: true
        // ignore: 'all-f04c545e28.css'
        // since:lastRun('templates')  // срабатывает только при втором запуске череp watch (инкрементальная сборка)
      })
      .pipe(debug({
        'title': `раздел: ${part}`
      }))
      .pipe(concat('prod' + project_name + '.' + part))
      // вот тут добавляем все что осталось в манифесте
      // .pipe(dest( target_part_path ))
      .pipe(through.obj((main_file, enc, file_cb) => {
        logger.warn('раздел: ' + part);
        logger.info('итоговый файл:' + main_file.path);

        // logger.info('excepts main',excepts)
        if (excepts.length) {
          // let sources = [target_part_path + `/**/*`];
          // let sources = [`${target_part_path}/**/(${excepts}).${part}`];
          // logger.info('sources2',sources)
          // let sources = [`${target_part_path}/*(${excepts})`];

          glob.sync(`${target_part_path}/*(${excepts})`, {})
            .forEach(function (addition) {
              logger.info('добавляю: ' + addition)
              // logger.info(addition)
              var contents = fs.readFileSync(addition, enc);
              // logger.info(contents);
              main_file.contents = Buffer.concat([
                main_file.contents,
                Buffer.from(contents, enc)
              ]);
            })
        }
        file_cb(null, main_file)
      }))
      // .pipe(dest( target_part_path ))

      // .pipe(gulpif(hasManifest, rev()))
      // .pipe(rename(function (path) {
      //   path.basename += ".min";
      // }))

      .pipe(rename(function (path) {
        path.basename += ".min";
      }))

      .pipe(gulpif(hasManifest, rev()))
      .pipe(dest(target_part_path))

      .pipe(through.obj((file, enc, cb) => {
        logger.info('копирую в min', target_path);
        logger.info({
          path: file.path,
          cwd: file.cwd,
          base: file.base,
          relative: file.relative,
          dirname: file.dirname,
          basename: file.basename,
          extname: file.extname,
          stem: file.stem,
        })
        src(file.path, {
            base: file.base,
          })
          // изменяем расположение файлов на кореневое, в данном случае
          // все файлы ложим в fonts
          // .pipe(rev())

          // .pipe(rev())
          // .pipe(dest(target_part_path))

          // .pipe(rev())
          .pipe(gzip({
            append: false,
            skipGrowingFiles: true,
            preExtension: 'gz'
          }))
          // .pipe(rename(function (path) {
          //   path.basename += ".gz";
          // }))
          // .pipe(rev())
          // .pipe(gulpif(hasManifest, rev()))
          .pipe(dest(target_part_path));
        cb(null, file)
        // cb()
      }))

      // .pipe(gulpif(hasManifest, rev()))
      // .pipe(rev())
      // .pipe(dest(target_part_path))

      // .pipe(gulpif(!isDevelopment, combine(rev.manifest('tmp/manifest/production.json',{
      .pipe(combine(rev.manifest('tmp/manifest/production.json', {
          base: 'tmp/manifest',
          // cwd: 'css',
          merge: true // Merge with the existing manifest if one exists
        }), dest('./tmp/manifest')
        .on('finish', function () {
          console.log('combine manifest with: ' + part);
          logger.warn('combine manifest with: ' + part);
          if (manifest_parts.length - 1 == i) {
            // logger.warn('finish');
            done();
          }
        })
      ));
    console.log('XXXXXX');
  });




  // return src([
  //   './src/**',
  //   '!src/**/_*/',      //exclude folders starting with '_'
  //   '!src/**/_*/**/*',  //exclude files/subfolders in folders
  //   '!./src/vendors/**',
  //   '!./src/css/**',
  //   '!./src/js/**',
  //   '!./src/templates/**'
  // ],{
  //   base:'src',
  //   since:lastRun('assets')  // срабатывает только при втором запуске череp watch (инкрементальная сборка)
  //                            // либо при первом в обычной сборке
  // })

})

const compile_stylus = function (part, part_path) {
  // series(clean, 'get_folders', 'browser-sync');
  const target_path = config.target_path__assets + 'css/include';

  return src(part_path)
    .pipe(gulpif(isDevelopment, sourcemaps.init()))
    .pipe(gulpif(function (file) {
      return (file.extname == '.styl') ? true : false;
    }, stylus()))
    .on('error', notify.onError(function (err) {
      return {
        title: 'Stylus',
        message: err.message
      }
    }))
    .pipe(debug({
      'title': 'sourcemaps'
    }))
    // .pipe(gulpif(isDevelopment,sourcemaps.init()) ) //???
    .pipe(concat(part + '.css'))
    .pipe(autoprefixer())

    // сжимает результат
    .pipe(cleanCSS({
      // compatibility: 'ie8',
      level: {
        1: {
          all: true,
          normalizeUrls: false
        },
        2: {
          restructureRules: true
        }
      }
    }))
    .pipe(gulpif(isDevelopment, sourcemaps.write()))
    .pipe(dest(target_path))
    .pipe(through.obj((file, enc, cb) => {
      logger.info('копирую в ', file.path);
      // logger.info({
      //   path:file.path,
      //   cwd:file.cwd,
      //   base:file.base,
      //   relative:file.relative,
      //   dirname:file.dirname,
      //   basename:file.basename,
      //   extname:file.extname,
      //   stem:file.stem,
      // })
      cb(null, file)
    }))
}

task('prepare_stylus', function (done) {
  return done(); //????
  // if (!isDevelopment) return done();

  // logger.info(process.cwd());
  // const main_path =  process.cwd() + '/src/css/';
  // fs.readdir(main_path, {withFileTypes:true}, (err, files) => {
  //     let deal = (_item, _index, _array) => {
  //         if (_item.isDirectory()) {
  //           logger.info('Нашел папку в стилях: ', _item);
  //           var target_css_path = path.join(main_path,_item.name)
  //           logger.info('1',target_css_path)
  //           logger.info('2',path.relative(process.cwd(), target_css_path));
  //           // compile_stylus(_item.name, target_css_path + '/**/*.styl');
  //           compile_stylus(_item.name, target_css_path + '/*.styl');
  //         }
  //     };
  //     files.forEach(deal);
  // });
  // done();
});

task('vendors:fonts', function (cb) {
  let target_path = config.target_path__assets + 'fonts';
  if (!vendors_config.fonts) return cb();
  return src(
      vendors_config.fonts, {
        cwd: config.src_vendors,
        base: 'src/' + domain + '/vendors/',
        since: lastRun('vendors:fonts') // срабатывает только при втором запуске через watch (инкрементальная сборка)
        // либо при первом в обычной сборке
      }
    )
    // .pipe(dest(target_path))
    .pipe(through.obj((file, enc, cb) => {
      logger.info('копирую шрифты в', target_path);
      logger.info({
        path: file.path,
        cwd: file.cwd,
        base: file.base,
        relative: file.relative,
        dirname: file.dirname,
        basename: file.basename,
        extname: file.extname,
        stem: file.stem,
      })
      src(file.path, {
          base: file.base,
        })
        // изменяем расположение файлов на кореневое, в данном случае
        // все файлы ложим в fonts
        .pipe(rename(function (file_path) {
          // file_path.dirname = file_path.basename; // таким образом директорией будет название файла
          file_path.dirname = '/';
          logger.info('путь к файлу ', file_path);
          // file_path.basename = file_path.basename.replace(new RegExp('^_'), '');
        }))
        .pipe(dest(target_path));
      cb(null, file)
    }))

    .pipe(browserSync.stream())
    .pipe(debug());
})

task('vendors:js', function (cb) {
  let target_path = config.target_path__assets + 'js';
  if (!vendors_config.js) return cb();
  return src(
      vendors_config.js, {
        cwd: config.src_vendors,
        base: 'src/' + domain + '/vendors/',
        // cwdbase: true,
        since: lastRun('vendors:js') // срабатывает только при втором запуске через watch (инкрементальная сборка)
        // либо при первом в обычной сборке
      }
    )
    .pipe(gulpif(isDevelopment, sourcemaps.init()))
    .pipe(concat('vendors.js'))
    .pipe(gulpif(isDevelopment, sourcemaps.write()))
    .pipe(dest(target_path))
    .pipe(browserSync.stream())
    .pipe(debug());
})


task('vendors:css', function (cb) {
  let target_path = config.target_path__assets + 'css';
  if (!vendors_config.css) return cb();
  return src(
      vendors_config.css, {
        cwd: config.src_vendors,
        base: 'src/' + domain + '/vendors/',
        since: lastRun('vendors:css') // срабатывает только при втором запуске через watch (инкрементальная сборка)
        // либо при первом в обычной сборке
      }
    )
    .pipe(cached('vendors_css'))
    .pipe(debug({
      'title': 'sourcemaps'
    }))
    .pipe(gulpif(isDevelopment, sourcemaps.init()))

    .pipe(concat('vendors.css'))

    // .pipe(cleanCSS({compatibility: 'ie8'})) // сжимает результат
    .pipe(gulpif(isDevelopment, sourcemaps.write()))
    .pipe(dest(target_path))
    .pipe(debug());
})


// основная задача Babel, переводит es6->es5
task('babel', function (cb) {
  let target_path = config.target_path__assets + 'js';
  // return src('src/js/*.js')
  //   .pipe(babel({
  //     presets: ['@babel/preset-env']
  //   }))
  //   .uglify()
  //   .pipe(dest(target_path))
  // .pipe(notify({
  //   message: "Generated file: <%= file.relative %> @ <%= options.date %>",
  //   templateOptions: {
  //     date: new Date()
  //   }
  // }))

  pump([
      src('src/' + domain + '/js/*.js'),
      debug({
        'title': 'sourcemaps js'
      }),
      gulpif(isDevelopment, sourcemaps.init()),
      gulpif(isDevelopment, dest(target_path + '/source/')),
      babel({
        presets: ['@babel/preset-env']
      }),
      gulpif(!isDevelopment, uglify()),
      gulpif(isDevelopment, sourcemaps.write()),
      gulpif(hasManifest, rev()),
      dest(target_path),
      gulpif(!isDevelopment, combine(rev.manifest('tmp/manifest/development.json', {
        // есть проблема с работой merge вот тут можно почитать:
        // https://github.com/sindresorhus/gulp-rev/issues/123
        base: 'tmp/manifest',
        // cwd: 'css',
        merge: true // Merge with the existing manifest if one exists
      }), dest('./tmp/manifest')))
    ],
    cb
  );

});


// const nunjucks_compiler = function (src_templates = config.src_templates + '/**/*', target_path = './tmp/templates') {
// const nunjucks_compiler = function (src_templates = config.src_templates, target_path = './tmp/templates_compiled', done) {
const nunjucks_compiler = function (done, src_templates = './tmp/templates_prepared', target_path = './tmp/templates_compiled') {
  // let target_path = './dist2';
  logger.info('nunjucks_compiler', src_templates);

  // var pipeLine = src(src_templates + '/**/*', {
  var pipeLine = src(src_templates + '/*', {
    // base:'/'
    // since:lastRun('templates')  // срабатывает только при втором запуске череp watch (инкрементальная сборка)
    // либо при первом в обычной сборке
  });

  let _config = {};
  try {
    // _config = require('./src/_/config.json');
    _config = gulpConfig.modx;
    _config = {
      "_modx": {
        "config": _config
      }
    };
  } catch (e) {
    logger.error('Не смог получить файл: ' + e.message);
    attention();
  }

  let _placeholders = {};
  try {
    // _placeholders = require('./src/_/placeholders.json');
    _placeholders = gulpConfig.placeholders;
  } catch (e) {
    logger.error('Не смог получить файл: ' + e.message);
    attention();
  }

  let _layout_config = {};
  try {
    // _placeholders = require('./src/_/placeholders.json');
    _layout_config = gulpConfig.layout;
    // _layout_config = gulpConfig.get_config('_layout');
  } catch (e) {
    logger.error('Не смог получить файл: ' + e.message);
    attention();
  }

  // throw new Error('show vars');

  // замена функции include, т.е. с переменными она плохо конверировалась в fenom
  function nunjucks_macros_include(path = '', props = {}) {
    // Старый вариант
    // {% macro inc(path='',props={}) %}
    //   <p>inc props: {{ props|dump }}</p>
    //   {* {% s2et props = props %} *}
    //   {% include path %}
    // {% endmacro%}

    if (!path || !path.length) {
      logger.error("Не указан путь к шаблону")
      return "Не указан путь к шаблону";
    }

    let data = {};
    if (typeof props == 'object') {
      if (!props.hasOwnProperty('props')) {
        data['props'] = props;
      } else {
        data = props;
      }
    } else {
      data['props'] = props;
    }

    // this.env
    // this.ctx // все переменные которые хранит nunjucks в том числе объявленные ранее через set
    let _vars_original = this.ctx;
    let _vars_inc = Object.assign({},
      this.ctx,
      data
    );

    // logger.info('this', this)
    // logger.info('arguments', arguments)
    // logger.info('nunjucks_macros_inc vars:' + JSON.stringify(_vars_inc))
    logger.info('nunjucks_macros_inc vars:', _vars_inc)
    // var result = new nunjucks.precompileString('{% include "_/sections/header.tpl" %}', {});
    // var tmpl = new nunjucks.Template('Hello {{ username }}');
    // var res = nunjucks.render('others/test.tpl', { "first":7777777 });
    let tmpl = this.env.getTemplate(path, false, null, true);
    // logger.info('tmpl', tmpl)
    let result = '';
    if (tmpl && tmpl.path) {
      result = nunjucks.render(tmpl, _vars_inc);
    } else {
      result = `<b style="background: red;color: #fff;padding: 5px;">Файл шаблона: ${path} не найден!</b>`;
    }
    this.ctx = _vars_original;
    // delete _vars_inc;
    // delete props;
    return result;
  }

  // let _vars = Object.assign({},
  // let _vars = objectAssign(
  // let _vars = _.merge(
  let _vars = _merge(
    _config,
    _placeholders, {
      _my: {
        templateUrlBase: config.tpl_templateUrlBase
      },
      "include": nunjucks_macros_include,
    }, {
      "_modx": {
        "config": {
          "site_dev_mode": isDevelopment
        }
      }
    },
    _layout_config
  );

  logger.info('Используемые переменные в шаблоне', _vars);
  logger.info(_vars);

  pipeLine = pipeLine
    .pipe(nunjucks_gulp.compile(
      _vars, {
        // env: nunjucks_env,
        // 'inc': nunjucks_macros_inc,
        tags: {
          // blockStart: '<%',
          // blockEnd: '%>',
          variableStart: '{{$',
          variableEnd: '}}',
          commentStart: '{*',
          commentEnd: '*}'
        },
        autoescape: false,
        trimBlocks: true,
        lstripBlocks: true
      }
    ))
    .pipe(dest(target_path));
  return pipeLine;
};
nunjucks_compiler.displayName = 'templates:compiler';
task(nunjucks_compiler);

// task('templates_prepare',function (ccc) {
const templates_prepare = function (done) {
  let target_path = './tmp/templates_prepared';

  // del([
  //     'tmp/**/*'
  //   ]);

  let pipeLine = src([
      config.src_templates + '/**/*' // ???
      // './src/templates/*.*' // ???
    ], {
      base: config.src_templates
      // base:'src/templates'
      // since:lastRun('templates')  // срабатывает только при втором запуске череp watch (инкрементальная сборка)
      // либо при первом в обычной сборке
    })
    .pipe(newer('templates_prepare')) // после newer лучше сжимать изображения, тогда это делается один раз

    // пример внесения изменнеий в файл через through
    .pipe(debug({
      'title': '[templates_prepare] core: ' + config.target_path__core
    }))
    .pipe(through.obj((file, enc, cb) => {
      // logger.info('templates_prepare: ', config.target_path__core);
      logger.info('[templates_prepare] file path:', file.path);
      logger.info({
        // contents:file.contents,
        path: file.path,
        // cwd:file.cwd,
        // base:file.base,
        // relative:file.relative,
        // dirname:file.dirname,
        // basename:file.basename,
        // extname:file.extname,
        // stem:file.stem,
      })

      if (!file.isDirectory() && (new RegExp('(\/|\\\\)').test(file.relative))) {
        // если не проверять на директорию то file.contents === null при попадании на папку
        logger.info(file.isBuffer());
        // var buf = Buffer.from(`<!-- ${file.relative} -->`, enc);
        file.contents = Buffer.concat([
          Buffer.from(`<!-- ${file.relative} -->\n`, enc),
          file.contents,
          Buffer.from(`\n<!-- /// ${file.relative} -->\n`, enc),
        ]);
      }

      if (!file.isDirectory()) {
        // подгоняем файл под шаблонизатор fenom
        var content = file.contents.toString(enc, 0, file.contents.length);

        content = content
          .replace(new RegExp('\{\{\\s*include\\s*\\(', 'gim'), "{{$include( ")
        // .replace(new RegExp('\{\\* ', 'gim'), "{# ")
        // .replace(new RegExp(' \\*\}', 'gim'), " #}")
        // .replace(new RegExp('\<\!-- \{\\*', 'gim'), "{* ")
        // .replace(new RegExp(' \\*\} --\>', 'gim'), " *}")
        ;

        file.contents = Buffer.from(`${content}`, enc);
      }

      cb(null, file)
    }))

    // пример внесения изменнеий в файл через tap
    // .pipe(tap(function(file, t) {
    //   if (path.extname(file.path) === '.tpl') {
    //
    //     var buf = Buffer.from('<!-- XXX2 -->hello', 'utf-8');
    //
    //     file.contents = Buffer.concat([
    //         file.contents,
    //         buf
    //     ]);
    //   }
    // }))
    .pipe(dest(target_path));

  // pipeLine.on('end', function () {
  //   logger.info('xxx')
  //   // debug({'title':'[templates] before nunjucks_compiler'});
  //   // return
  //     // nunjucks_compiler(target_path);
  //     // return pipeLine; ///????
  //     nunjucks_compiler(target_path,null,done);
  //     logger.info('yyy')
  //   //     .pipe(debug({'title':'[templates] before newer'}))
  //   //   ;
  //   done();
  //
  // });

  return pipeLine;
};
templates_prepare.displayName = 'templates:prepare';
task(templates_prepare);


// task('templates_prepare',function (ccc) {
const templates_convertor = function (done) {
  // let target_path = './tmp/templates_prepared';
  // if (!isDevelopment) return done();
  const manifest = src('tmp/manifest/**/*.json', {
    allowEmpty: true
  });
  // const manifest_dev = src('tmp/manifest/development.json',{allowEmpty:true});
  // const manifest_prod = src('tmp/manifest/production.json',{allowEmpty:true});

  let pipeLine = src([
      config.src_templates + '/**/*' // ???
      // './src/templates/*.*' // ???
    ], {
      base: config.src_templates
      // base:'src/templates'
      // since:lastRun('templates')  // срабатывает только при втором запуске череp watch (инкрементальная сборка)
      // либо при первом в обычной сборке
    })
    .pipe(debug({
      'title': '[templates_convertor]'
    }))
    .pipe(newer('templates_convertor')) // после newer лучше сжимать изображения, тогда это делается один раз

    // пример внесения изменнеий в файл через through
    .pipe(through.obj((file, enc, cb) => {
      // logger.info('zxc ', config.target_path__core);

      if (!file.isDirectory()) {
        // подгоняем файл под шаблонизатор fenom
        // {% endblock %}
        var content = file.contents.toString(enc, 0, file.contents.length);

        switch (config.convertor_type) {
          case 'fenom':
            content = content.replace(new RegExp('\{%\\s*endblock\\s*%\}', 'gi'), '{/block}');

            // var content = "{% block top %} -> {block 'top'}"
            content = content.replace(new RegExp('\{%\\s*block\\s*([^\\s]+)\\s*%\}', 'gim'), "{block '$1'}");
            // console.log(content);

            // if (new RegExp('\{% block (.*) %\}', 'gim').test(content)){
            // logger.info('ZZZZZZZZz')
            // }

            let spliters = content.match(/\{\%\s+set\s+(.*)\s+\%\}/gm);
            logger.info('spliters', spliters);

            if (spliters && spliters.length) {
              spliters.forEach(function (replacement) {
                let match;
                logger.info('replacement', replacement);
                // match = replacement.match(/\{\{\s+inc\([\'|\"]([^\'|\"]+)[\'|\"],\s*(.*)\s*\)\s+\}\}/);
                match = replacement.match(/\{\%\s+set\s+(\w+)\s*=\s*(.*)\s+\%\}/);
                let var_name = match[1];
                logger.info('match', match);
                // throw new Error('something bad happened');

                if (match.length > 1) {

                  let cur_type = match[2].trim()
                  // получаем тип вставки, это может быть:
                  // {"a":"b"}
                  // "text"
                  // 'text'
                  // $var
                  // logger.info('cur_type',cur_type);
                  // logger.info('cur_type2',cur_type[0]);
                  let substitute = '';
                  // switch (cur_type[0]) {
                  switch (true) {
                    // case '\{':
                    case /\{/.test(cur_type[0]):
                      substitute = cur_type.replace(/:/gm, " => ")
                        .replace(/\{/, "[")
                        .replace(/\}/, "]");
                      break;
                      // case '"':
                      // case "'":
                    case /[0-9|\'|\"]/.test(cur_type[0]):
                      substitute = cur_type;
                      break;

                      // case "$":
                    case /\$/.test(cur_type[0]):
                      substitute = cur_type
                      break;

                    default:
                      substitute = "$$" + cur_type
                      // substitute="$$$2"
                  }

                  content = content.replace(replacement, '{set $$' + var_name + ' = ' + substitute + '}');
                }
                // else{
                //   logger.info('match xxx',match);
                //   throw new Error('something bad happened');
                // }
              });

              // content = content.replace(new RegExp('\{\{\\s+inc\\([\'|\"](.*)[\'|\"],\\s+(.*)\\s*\\)\\s+\}\}', 'gim'), "{include 'path:$1' props="+substitute+"}");
              // content = content.replace(new RegExp('\{\{ inc\\([\'|\"](.*)[\'|\"],\\s+(\\w+)\\s*\\)\\s+\}\}', 'gim'), "{include 'path:$1' props=$$$2}");
              // logger.info(content);
            }


            // content = "{ inc('others/test.tpl', props) }";
            // content = content.replace(new RegExp('\{\{ inc\\([\'|\"](.*)[\'|\"], (\w) \\) \}\}', 'gim'), "{include 'path:$1' props=\$$2}");
            // {{ inc('others/test.tpl', xxx) }} -> {include 'path:info/phone.tpl' props=$xxx}
            // spliters = content.match(/\{\{\s+inc\([\'|\"](?:.*)[\'|\"],\s*(.*)\s*\)\s+\}\}/gm);
            spliters = content.match(/\{\{\s*\$?include\s*\([\'|\"](?:.*)[\'|\"],\s*(.*)\s*\)\s*\}\}/gm);
            // logger.info('spliters',spliters);

            if (spliters && spliters.length) {
              spliters.forEach(function (replacement) {
                let match;
                logger.info('replacement', replacement);
                // match = replacement.match(/\{\{\s+inc\([\'|\"]([^\'|\"]+)[\'|\"],\s*(.*)\s*\)\s+\}\}/);
                match = replacement.match(/\{\{\s*\$?include\s*\([\'|\"]([^\'|\"]+)[\'|\"],\s*(.*)\s*\)\s*\}\}/);
                let include_path = match[1];
                logger.info('match', match);

                if (match.length > 1) {

                  let cur_type = match[2].trim()
                  // получаем тип вставки, это может быть:
                  // {"a":"b"}
                  // "text"
                  // 'text'
                  // $var
                  // logger.info('cur_type',cur_type);
                  // logger.info('cur_type2',cur_type[0]);
                  let substitute = '';
                  switch (cur_type[0]) {
                    case '\{':

                      // var cur_type = [];
                      // cur_type.push('{zzzz:123, xxx:555}');
                      // cur_type.push('{"zzzz":"123", "xxx":555}');
                      // cur_type.push('{ "zzzz":"123", "xxx":555 }');
                      // cur_type.push('{ "zzzz" : "123", "xxx" : "555" }');
                      // cur_type.push("{ 'zzzz' : '123', 'xxx' : '555' }");
                      //
                      // cur_type.each(function(i, elem) {
                      substitute = cur_type
                        .replace(new RegExp('[\'|\"]?(\\w+)[\'|\"]?\\s*\:', 'gim'), "\"$1\":")
                        // преобразует переменные добавляя в ним $: 'xxx':yyy => 'xxx':$yyy, 'xxx':1yyy => 'xxx':$1yyy, 'xxx':1yyy5 => 'xxx':$1yyy5, 'xxx':15 => 'xxx':15
                        .replace(new RegExp(':\\s*(?!\'|\")((\\d*)[A-z]+[^\,|\}|\\s]*)\\s*(?!\'|\")', 'gim'), ":$$$1")
                        .replace(/:/gm, " => ")
                        .replace(/\{/, "[")
                        .replace(/\}/, "]");
                      // logger.info(i, substitute);
                      // })


                      // вариант прямой передачи параметров
                      // substitute = cur_type.replace(/:/gm, "=")
                      //                      .replace(/\{/, "")
                      //                      .replace(/\}/, "")
                      // ;


                      // logger.info('substitute',substitute)
                      // throw new Error('something bad happened');

                      break;

                    case '"':
                    case "'":
                      substitute = cur_type;
                      break;

                    case "$":
                      substitute = cur_type
                      break;

                    default:
                      substitute = "$$" + cur_type
                      // substitute="$$$2"
                  }

                  content = content.replace(replacement, "{include 'path:" + include_path + "' props=" + substitute + "}");
                }
              });

              // content = content.replace(new RegExp('\{\{\\s+inc\\([\'|\"](.*)[\'|\"],\\s+(.*)\\s*\\)\\s+\}\}', 'gim'), "{include 'path:$1' props="+substitute+"}");
              // content = content.replace(new RegExp('\{\{ inc\\([\'|\"](.*)[\'|\"],\\s+(\\w+)\\s*\\)\\s+\}\}', 'gim'), "{include 'path:$1' props=$$$2}");
              // logger.info(content);
            }

            // {{ inc('others/test.tpl') }} -> {include 'path:info/phone.tpl'}
            // var content = "{{ include('others/test.tpl') }} {{ include('others/test.tpl') }}";
            // content = content.replace(new RegExp('\{\{\\s*\\$?include\\s*\\(\\s*[\'|\"](.*)[\'|\"]\\s*\\)\\s*\}\}', 'gim'), "{include 'path:$1'}");
            content = content.replace(new RegExp('\{\{\\s*\\$?include\\s*\\(\\s*([\'|\"])([^\\1|\\s]+)\\1\\s*\\)\\s*\}\}', 'gim'), "{include 'path:$2'}");
            // console.log(content);
            // content = content.replace(new RegExp('\{\{\\s+inc\\([\'|\"](.*)[\'|\"]\\s*\\)\\s\}\}', 'gim'), "{include 'path:$1'}");

            // {% include "others/breadcrumbs.tpl" %} -> {include "path:others/system_info.tpl"}
            // var content = '{% include "others/breadcrumbs.tpl" %}';
            // content = content.replace(new RegExp('\{% include [\'|\"](.*)[\'|\"] %\}', 'gim'), "{include 'path:$1'}");
            // content = content.replace(new RegExp('\{% include (?:[\'|\"])([^$1]+)[\'|\"] %\}', 'gim'), "{include 'path:$1'}");
            content = content.replace(new RegExp('\{%\\s*include\\s*([\'|\"])([^\\1|\\s]+)\\1\\s*%\}', 'gim'), "{include 'path:$2'}");


            // {{$"mode_development" if _modx.config.site_dev_mode else "default"}} -> {($_modx.config.site_dev_mode?'mode_development':'default')}
            // var content = `{{$"mode_development" if _modx.config.site_dev_mode}}
            //     ccc {{$"mode_development2222" if _modx.config.site_dev_mode else "default222"}}`;
            content = content.replace(new RegExp('{{\\s*\\$([\'|"])(.*)\\1\\s+if\\s+([\\w|\\.|\\_]*)\\s*(else\\s*([\'|"])(.*)\\5)?\\s*}}', 'gim'), "{($$$3 ? '$2' : '$6')}");
            // console.log(content);
            // content = content.replace(new RegExp('\{\{\\s*\\$_modx\.config\.([^\}]+)\\s*\}\}', 'gim'), "{$_modx->config['$1']}");

            // {{$_modx.config.site_name}} -> {$_modx->config['site_name']}
            // content = content.replace(new RegExp('\{\{\\s*\\$_modx\.config\.(.*)\\s*\}\}', 'gim'), "{$_modx->config['$1']}");
            // content = content.replace(new RegExp('\{\{\\s*\\$_modx\.config\.([^\}]+)\\s*\}\}', 'gim'), "{$_modx->config['$1']}");
            content = content.replace(new RegExp('\\$_modx\\.config\\.(\\w+)', 'g'), "$_modx->config['$1']");

            // замена {{ super() }} -> {parent}
            content = content.replace(new RegExp('{{\\$?\\s*super\\s*\(\)\\s*}}', 'gim'), "{parent}")

            // {% extends '_layout_static.tpl' %} -> {extends 'path:layout_static'}
            // content = content.replace(new RegExp('\{% extends ([\'|\"])_?(.*)[\'|\"] %\}', 'gim'), "{extends 'path:web/$2'}")
            content = content.replace(new RegExp('\{%\\s*extends\\s*([\'|\"])_?([^\\1|\\s]+)\\1\\s*%\\s*\}', 'gim'), "{extends 'path:web/$2'}")
              .replace(new RegExp('\{\{\\s*', 'gim'), "{")
              .replace(new RegExp('\\s*\}\}', 'gim'), "}")
              .replace(new RegExp('\{# ', 'gim'), "{* ")
              .replace(new RegExp(' #\}', 'gim'), " *}")
              .replace(new RegExp('\<\!--\\s*\{\\*\\s*', 'gim'), "{* ")
              .replace(new RegExp('\\s*\\*\}\\s*--\>', 'gim'), " *}")
              .replace(new RegExp('\<\!--\\s*', 'gim'), "{* ")
              .replace(new RegExp('\\s*--\>', 'gim'), " *}");
            break;
        }

        file.contents = Buffer.from(`${content}`, enc);

        // fs.appendFile(config.target_path__core + file.relative, content, function (err) {
        // fs.open(config.target_path__core + file.relative, content, 'w',function (err,file) {
        //   if (err) throw err;
        //   logger.info('Saved!');
        // });
      }

      cb(null, file)
    }))
    .pipe(rename(function (file_path) {
      file_path.basename = file_path.basename.replace(new RegExp('^_'), '');
    }))
    // .pipe(gulpif(!isDevelopment,revRewrite({ manifest }))) // Substitute in new filenames

    // .pipe(gulpif(!isDevelopment, revRewrite({
    .pipe(gulpif(hasManifest, revRewrite({
      manifest,
      replaceInExtensions: ['.tpl']
    }))) // Substitute in new filenames
    // .pipe(gulpif(!isDevelopment,revRewrite({ "manifest":manifest_dev }))) // Substitute in new filenames
    // .pipe(gulpif(!isDevelopment,revRewrite({ "manifest":manifest_prod, replaceInExtensions: ['.tpl'] }))) // Substitute in new filenames
    .pipe(dest(config.target_path__core));
  return pipeLine;
};
templates_convertor.displayName = 'templates:convertor';
task(templates_convertor);



// task('templates:parser', series('templates:prepare', 'templates2', function(done) {
task('templates:parser', parallel('templates:convertor', series('templates:prepare', 'templates:compiler', function (done) {
  const manifest = src('tmp/manifest/**/*.json', {
    allowEmpty: true
  });
  // const manifest_dev = src('tmp/manifest/development.json',{allowEmpty:true});
  // const manifest_prod = src('tmp/manifest/production.json',{allowEmpty:true});
  let target_path = './dist';
  var pipeLine = src([
      './tmp/templates_compiled/**/*' // ???
    ], {
      base: 'tmp/templates_compiled'
      // since:lastRun('templates')  // срабатывает только при втором запуске череp watch (инкрементальная сборка)
      // либо при первом в обычной сборке
    })
    // .pipe(debug({'title':'[templates] before newer'}))
    // если имя начинается с _ пропускаем (не копируем в dist)
    .pipe(through.obj((file, enc, cb) => {
      // logger.info('копирую в ', config.target_path__core);
      // logger.info({
      //   path:file.path,
      //   cwd:file.cwd,
      //   base:file.base,
      //   relative:file.relative,
      //   dirname:file.dirname,
      //   basename:file.basename,
      //   extname:file.extname,
      //   stem:file.stem,
      // })
      // if (file.extname == '.tpl'){
      //   src(file.path,{
      //     base: file.base,
      //   })
      //     // если имя начинается с _ переименовываем
      //     .pipe(rename(function (file_path) {
      //       file_path.basename = file_path.basename.replace(new RegExp('^_'), '');
      //     }))
      //     .pipe(dest(config.target_path__core))
      //   ;
      // }

      // не копируем в dist если файл начинается с _ или находится в подкаталоге (т.к. мы уже произвели)
      // обработку шаблона через шаблонизатор и эти файлы в продакшене нам не нужны
      // if ( !file.extname || (new RegExp('^_').test(file.basename)) || (new RegExp('\/').test(file.basename))){
      if (!file.extname || (new RegExp('^_').test(file.basename)) || (file.relative.includes('/'))) {
        logger.info('не копируем файл!!!', file.basename);
        cb();
        return;
      }

      cb(null, file)
    }))

    // переименовываем tpl->html
    .pipe(gulpif(function (file) {
      return (file.extname == '.tpl') ? true : false;
    }, rename(function (file_path) {
      file_path.extname = '.html';
    })))
    .pipe(gulpif(hasManifest, revRewrite({
      manifest
    }))) // Substitute in new filenames
    // .pipe(gulpif(!isDevelopment,revRewrite({ "manifest":manifest_dev }))) // Substitute in new filenames
    // .pipe(gulpif(!isDevelopment,revRewrite({ "manifest":manifest_prod }))) // Substitute in new filenames
    .pipe(dest(target_path))
    .pipe(browserSync.stream()) // на ней останавлаивается
  ;

  logger.info('FINISH');

  return pipeLine;
  // done();
})));



//   logger.info('Очищаем dist')
//   return del([
//       'dist/**/*',
//     ]);
// };
// clean.displayName = 'clean:all';
// task(clean);

// const browser-sync = function(cb) {
task('browser-sync', function (cb) {
  if (!isWatch) return cb();
  browserSync.init({
    // proxy: {
    //     target: "localhost:8080", // can be [virtual host, sub-directory, localhost with port]
    //     ws: true // enables websockets
    // },

    // Per-route middleware
    // NOTE: requires v2.12.1
    middleware: [{
      route: "/api",
      handle: function (req, res, next) {
        // logger.info('req: ',req);
        // res.send('Hello World!');
        logger.info('Request Type:', req.method);
        next();
      }
    }],
    server: {
      baseDir: './dist/',
      index: "index.html",
      // routes: {
      //   "/bower_components": "bower_components"
      // }
      // ws: true,
      // proxy: "yourlocal.dev"
      // proxy: "local.dev",
      // socket: {
      //   domain: 'localhost:3000'
      // }
    },
    notify: true,
  });
});

task('prepare_css', function (cb) {
  // series(clean, 'prepare_stylus', 'stylus')(cb);
  return series('prepare_stylus', 'stylus')(cb);
  // series('prepare_stylus', 'stylus');
  // return cb();
});


task('shell', function (cb) {
  if (config.shell && config.shell.length) {

    for (var action in config.shell) {
      if (config.shell.hasOwnProperty(action) && typeof config.shell[action] === 'string') {
        let shell_action = config.shell[action];
        shell.exec(shell_action, {
          silent: true
        }, function (code, stdout, stderr) {
          if (code) {
            let msg = 'Ошибка выполнения скрипта: ' + shell_action
            logger.error(msg);
            // logger.error('Program output:' + stdout);
            logger.error('Program stderr:' + stderr);
            cb(msg);
          } else {
            let msg = 'Cкрипт выполнен успешно: ' + shell_action
            logger.info(msg);
            logger.info('Program output:', stdout);
            // cb();
          }
        });
      }
    }
    // cb(msg);
  } else {
    logger.warn('нет задания для таска shell');
  }
  cb();
});


task('build', function (cb) {
  return series(clean,
    parallel(
      'sprites:svg_font', 'sprites:png', 'sprites:svg'
    ),
    parallel(
      'assets',
      'babel',
      'vendors:js',
      'vendors:css',
      'vendors:fonts',
      // 'prepare_css'
      // 'browser-sync'
    ),
    'prepare_css', 'images', 'combine_production', 'templates:parser')(cb);
});


task('watch', function (cb) {
  if (!isWatch) return cb();

  // watch(['./src/templates/**/*','./src/_/*'], series('templates:parser'))
  watch(['./src/' + domain + '/templates/**/*', './src/' + domain + '/_config/**/*'], series('templates:parser'))
    .on('unlink', function (filepath) {
      // удаляем файл из целевой папки
      var filePathFromSrc = path.relative(path.resolve('src/' + domain + '/templates'), filepath);
      // log('del0=',filepath);
      // log('del1=',filePathFromSrc);
      // Concatenating the 'build' absolute path used by gulp.dest in the scripts task
      var destFilePath = path.resolve(config.target_path__core, filePathFromSrc);

      // log('del2=',destFilePath);
      del.sync(destFilePath);
      // del0= src/templates/menu/top0.tpl
      // del1= menu/top0.tpl
      // del2= /run/media/setest/MiniSet2/Работа/vue/exercises/bp/dist/core/components/smarttemplates/templates/web/menu/top0.tpl
    });
  watch('./src/' + domain + '/images/_sprites/**/*', series(parallel('sprites:svg_font', 'sprites:png', 'sprites:svg'), 'prepare_css'));
  watch('./src/' + domain + '/css/**/*', series('prepare_css', 'combine_production'));
  watch('./src/' + domain + '/js/**/*', series('babel', 'combine_production'));
});




// notify(
//   {
//     title: 'test',
//     subtitle: 'subtitle',
//     message: 'message',
//     sound: true, // Case Sensitive string for location of sound file, or use one of macOS' native sounds (see below)
//     icon: 'Terminal Icon', // Absolute Path to Triggering Icon
//     // contentImage: void 0, // Absolute Path to Attached Image (Content Image)
//     open: 'http://ya.ru', // URL to open on Click
//     wait: true, // Wait for User Action against Notification or times out. Same as timeout = 5 seconds
//
//     // New in latest version. See `example/macInput.js` for usage
//     timeout: 50, // Takes precedence over wait if both are defined.
//     // closeLabel: void 0, // String. Label for cancel button
//     // actions: void 0, // String | Array<String>. Action label or list of labels in case of dropdown
//     // dropdownLabel: void 0, // String. Label to be used if multiple actions
//     reply: true // Boolean. If notification should take input. Value passed as third argument in callback and event emitter.
//   },
//   function(error, response, metadata) {
//     logger.info(response, metadata);
//   }
// ).write("zxcv");

// exports.default = series(clean, parallel(css, javascript, 'babel', 'bundle'));
// exports.default = series(clean, parallel(css, javascript, 'babel'));
// exports.default = series(clean, 'watch', 'browser-sync');
// exports.default = series(clean, 'watch', 'browser-sync');
exports.default = series(clean, 'build', parallel('watch', 'browser-sync'));
