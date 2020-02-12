const winston = require('winston'),
      { createLogger, format, transports } = require('winston'),
      fs = require('fs'),
      path = require('path'),
      del = require('del')
;

let winstonLogger = {
   config : {
     path_log: 'logs'
   },
   getLogger : function() {
     return this.logger
   },

   initialise : function() {
     this.clean()
         .createLogger();
   },

   clean : function() {
     if ( !fs.existsSync( this.config.path_log ) ) {
         // Create the directory if it does not exist
         fs.mkdirSync( this.config.path_log );
     }else{
       del.sync(path.join(this.config.path_log,'/**/*'));
     }
     return this;
   },

   createLogger : function() {
     this.logger = createLogger({
       level: 'debug',
       format: format.combine(
         format.timestamp(),
         // format.simple(),
         format.json(),
         // format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`),
         // format.colorize({ all: true })
       ),
       transports: [
         new winston.transports.File({ filename: path.join(this.config.path_log, '/error.log'), level: 'error' }),
         new winston.transports.File({ filename: path.join(this.config.path_log, '/combined.log') }),
         // new transports.Console(),
       ]
       // transports: [
       //   new transports.Console(),
       // ]
     });
     return this;
  },


  showLog : function() {
    if (!this.logger) {
      console.error('Logger не был инициирован');
      return false;
    }

    this.logger.add(new winston.transports.Console({
      format: format.combine(
        format.timestamp({
          format : 'YYYY-MM-DD hh:mm:ss.SSS'
        }),
        // format.json(),
        // format.prettyPrint({
        //   colorize:true
        // }),
        // format.simple(),
        // format.splat(),
        // format.label(),
        // format.cli(),
        // format.align(),
        // format.metadata(),

        // format((info, opts) => {
        //   console.log(info);
        //   console.log(opts);
        //   if (opts.yell) {
        //     info.message = info.message.toUpperCase();
        //   } else if (opts.whisper) {
        //     info.message = info.message.toLowerCase();
        //   }

        //   return info;
        // }),

        // format.combine(format.cli(), format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`)),
        format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`),
        format.colorize({ all: true })
      ),
    }));

  }

}
// Create new role type called super_role
var logger = Object.create(winstonLogger);
logger.initialise();



// logger.error('wowza');
// logger.log({
//   level: 'info',
//   message: 'Hello distributed log files!'
// });
//
// logger.info('Hello again distributed logs');
// logger.info('xxx', {"a":123,"b":{"c":777}}, 999);
// logger.error('Hello again distributed logs');
//
// logger.profile('test');
//
// setTimeout(function () {
//   //
//   // Stop profile of 'test'. Logging will now take place:
//   //   '17 Jan 21:00:00 - info: test duration=1000ms'
//   //
//   logger.profile('test');
// }, 1000);

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
