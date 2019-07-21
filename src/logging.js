const winston = require('winston');
const ip = require('ip');
const os = require('os');

winston.emitErrs = true;

const logger = new winston.Logger({
  level: 'debug',
  transports: [
    new (winston.transports.Console)()
  ],
  handleExceptions: true,
  humanReadableUnhandledException: true,
  exitOnError: false,
  meta: true
});

// Setup logging for LogDNA cloud logging.
if (process.env.LOGDNA_API_KEY) {
  require('logdna');
  const logLevel = process.env.LOGDNA_LEVEL || 'info';

  logger.add(winston.transports.Logdna, {
    level: logLevel,
    app: process.env.LOGDNA_APPNAME,
    index_meta: true,
    key: process.env.LOGDNA_API_KEY,
    ip: ip.address(),
    hostname: os.hostname()
  });

  logger.info(`[core] Started LogDNA winston transport. Running at log level ${logLevel}.`);
}

module.exports = logger;
