const
  cjson = require('cjson'),
  path = require('path'),
  template = require('es6-template-string'),
  loggerMod = require('./logger'),
  // _ = require('lodash'),
  _merge = require('lodash.merge'),
  logger = loggerMod.getLogger();
// loggerMod.showLog();
// var x;
// x= template.render('Node Version: ${ process.version }');
// x= template('Node Version: ${ process.version }');

// var m = 1,
// n = 2;
// var z = 'This is ${m + n}';
// x = template(z,{m,n});
// console.log(x);
// return;


class GulpConfig {
  constructor() {
    this.loggerMod = loggerMod;
  }

  initialize(data = {}) {
    this.domain = data.domain ? data.domain + '/' : 'web';
    this.config = {
      // инструкция по конфигу https://github.com/jkphl/svg-sprite/blob/master/docs/templating.md
      base_path: process.cwd(),
      src: process.cwd() + `/src/${this.domain}`,
      src_css: `src/${this.domain}css`,
      src_templates: `src/${this.domain}templates`,
      src_vendors: `src/${this.domain}vendors`,
      target_path: 'dist/',
      target_path_full: process.cwd() + '/dist/',
      target_path__assets: `dist/assets/templates/${this.domain}`,
      target_path__assets_full: process.cwd() + `/dist/assets/templates/${this.domain}`,
      // target_path__core: 'dist/core/components/smarttemplates/templates/web/',
      target_path__core: `dist/core/components/smarttemplates/templates/${this.domain}`,
      tpl_templateUrlBase: `assets/templates/${this.domain}`,
      convertor_type: 'fenom',
    };

  }

  get_config(part = 'common') {
    let result = {};
    let ext_config = {};
    // let filename = `./config/${part}.json`;
    let filename = `${this.config['src']}_config/${part}.json`;

    try {
      ext_config = cjson.load(filename);
      // for (var prop in ext_config) {
      //   if (ext_config.hasOwnProperty(prop) && typeof ext_config[prop] !== Object) {
      //     let property = ext_config[prop];
      // let property = ext_config;
      ext_config = JSON.stringify(ext_config);
      try {
        // let tmp = template(String(ext_config[prop]), {
        // logger.info('Config: \n' + JSON.stringify(this.config));
        ext_config = JSON.parse(template(ext_config,
          this.config
        ));

      } catch (e) {
        logger.error(`Ошибка подстановки свойств в файле: ${filename} \n\t--->`, e);
        process.exit(1);
      }
      // console.log(prop + " = " + ext_config[prop]);
      // }
      // }
      // console.log(ext_config);
      // process.exit(1);
    } catch (e) {
      logger.warn(`Файл основной конфигурации не обнаружен: ${filename}`);

      filename = `${this.config.base_path}/config/${part}.json`;
      try {
        ext_config = cjson.load(filename);
        ext_config = JSON.stringify(ext_config);
        try {
          ext_config = JSON.parse(template(ext_config,
            this.config
          ));

        } catch (e) {
          logger.error(`Ошибка подстановки свойств в файле: ${filename} \n\t--->`, e);
          process.exit(1);
        }
      } catch (e) {
        logger.warn(`Файл доп конфигурации не обнаружен: ${filename}`);
      }
    }


    switch (part) {
      // case 'vendors':
      //   result = {
      //     'part': 'vendors'
      //   }
      //   break;

      case 'config':
      case 'common':
        // default:
        // result = {'part':'common'}

        // result = Object.assign({}, this.config, {
        result = _merge(this.config, {
          svgFont: {
            fontName: 'svgIconFont',
            css_template: `${this.config['src']}css/_/_svg_font__stylus.tpl`,
            targetPath: '../../../../../tmp/css/svg-font.styl',
            fontPath: `${this.config.target_path__assets}fonts/`,
          },
          pngSprite: {
            // cssFormat: 'css',
            imgName: 'images/png-sprite.png',
            cssName: '../../../../tmp/css/png-sprite.styl',
            cssTemplates: {
              // https://github.com/twolfson/spritesheet-templates#css
              css: `${this.config['src']}css/_/_png-sprite.tpl`,
              stylus: `${this.config['src']}css/_/_png-sprite__stylus.tpl`,
            },
            cssHandlebarsHelpers: {
              toJSON: function (object) {
                return JSON.stringify(object);
              },
              toLowerCase: function (str) {
                if (str && typeof str === "string") {
                  return str.toLowerCase();
                }
                return '';
              },
              parseName: function (id = '', type = 'full') {
                // не получается с импортировать придется дублировать
                // import * as plugin from process.cwd() + "/src/css/_/plugins/parse_name.js";
                // const plugin = require (process.cwd() + "/src/css/_/plugins/parse_name.js");

                // logger.info('parse_name ', arguments);
                // logger.info('parse_name id = ', id);
                // logger.info('parse_name type = ', type);
                if (!id || typeof (id) !== 'string') {
                  logger.info('parse_name id not a string');
                  return id;
                }
                let val = id;
                let id_parsed = val.split('~');
                let state = id_parsed[0];
                let pseudo = '';
                // logger.info('id_parsed:',id_parsed);
                // logger.info('state:',state);
                if (id_parsed.length) {
                  // state = [state[0],state[1]];
                  id_parsed.shift();
                  pseudo = id_parsed.join(':');
                }
                // logger.info('pseudo:',pseudo);

                state = state.replace(/[\/|\\|\&|\+|\=|\-|\.|\s]+/gi, '-')
                  .replace(/[\[|\]|\(|\)]/gi, '')
                  .toLowerCase();

                // return state.shift() || null;
                let result = '';
                switch (type) {
                  case 'id':
                    result = state;
                    break;
                  case 'pseudo':
                    // result = state[1] || '';
                    result = pseudo;
                    break;
                  case 'obj':
                    // result = {"id":state[0],"pseudo":(state[1] ? state[1] : '')};
                    result = {
                      "id": state,
                      "pseudo": pseudo
                    };
                    break;

                  case 'full':
                  default:
                    // result = state[1] ? state[0] + ':' + state[1] : state[0];
                    result = state + (pseudo ? (':' + pseudo) : '');
                }
                return result;
              },
              stringCleaner: function (str) {
                // это необходимо иначе если в имени файла содержится что нить запрещенное
                // оно может быть отработано как тег от stylus
                if (str && typeof str === "string") {
                  str = str.replace(/[\/|\\|\&|\+|\=|\-|\.|\s]+/gi, '-')
                    .replace(/[\[|\]|\(|\)]/gi, '');
                }
                return str.toLowerCase();
              }
            }
          },

          svgSprite: {
            variables: { // Custom Mustache templating variables and functions
              test: 'это переменная', // она доступна в шаблоне как {{test}}
              // src_template_path: process.cwd() + '/src/css/_/',
              src_template_path: this.config.src + 'css/_/',
            },
            log: null, // (null, false, info, verbose or debug).
            shape: {
              id: { // SVG shape ID related options
                separator: '-', // Separator for directory name traversal
                whitespace: '-',
                pseudo: '~~~', // мне пришлось выключить псевдо таким образом и использовать
                // самостоятельное разделение селекторов через ~ и плагин parse_name.js
                // так как родной способ оставлял только первый псевдоселектор, т.е.
                // нельзя было использовать последовательные псевдоселекторы, например:
                // menu-item:active:hover или menu_item:before:hover итд
                generator: function (name) {
                  return path.basename(name.split(path.sep).join(this.separator), '.svg');
                }
              },
              spacing: { // Add padding
                padding: 20
              },
            },
            mode: {
              symbol: {
                // Indicator whether a `common` CSS class name has been specified
                prefix: ".i-svg_%s", // Prefix for CSS selectors
                dimensions: '', // Suffix for dimension CSS selectors
                inline: false,
                // bust: false,
                // bust: true || false, // Cache busting (mode dependent default value)        example: false,
                preview: false,

                sprite: "../images/sprites.symbol.svg", // Sprite path and name
                render: {
                  styl: {
                    dest: '../../../../../tmp/css/svg-sprite.styl',
                    template: `${this.config['src']}css/_/_svg_sprite-symbol__stylus.tpl` // оригинальные шаблоны тут node_modules/svg-sprite/tmpl/css
                  }
                }
              }
            }
          }
        });

        break;
    }
    // result = Object.assign({}, result, ext_config);
    result = _merge(result, ext_config);
    return result;
  }

  get common() {
    return this.get_config('common');
    // return this.calcArea();
  }
  get vendors() {
    return this.get_config('vendors');
    // return this.calcArea();
  }
  get modx() {
    return this.get_config('modx_config');
    // return this.calcArea();
  }
  get placeholders() {
    return this.get_config('placeholders');
    // return this.calcArea();
  }
  get layout() {
    return this.get_config('_layout');
    // return this.calcArea();
  }
}

const config = new GulpConfig();

if (module.parent) {
  // если запускается как модуль
  module.exports = config;
  // exports.run=run;
} else {
  config.initialize();
  // console.log(config22.common);
  config.loggerMod.showLog();
  // config.loggerMod.showLog();
  // logger.info('test');
  // logger.info('hello', {
  //   message: {'a':'222'}
  // });
  console.log(config.get_config('_layout'));
  console.log(config.layout);
  // console.log(config.get_config('placeholders'));
  // console.log(config.vendors);
  // console.log(config.get_config('config'));
  // console.log(config.vendors);
  // console.log(config.get_config('config'));
  // run();
}

// var obj = {
//   log: ['a', 'b', 'c'],
//   get latest() {
//     if (this.log.length == 0) {
//       return undefined;
//     }
//     return this.log[this.log.length - 1];
//   }
// }

// console.log(obj.latest);
// // expected output: "c"


// var language = {
//   set current(name) {
//     this.log.push(name);
//   },
//   log: []
// }

// language.current = 'EN';
// language.current = 'FA';

// console.log(language.log);
// // expected output: Array ["EN", "FA"]


// var obj = {
//   foo() {},
//   bar() {}
// };