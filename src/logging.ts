import winston = require('winston');
import * as ip from 'ip';
import * as os from 'os';

const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new (winston.transports.Console)({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      handleExceptions: true
    })
  ],
  exitOnError: false,
});

// Setup logging for LogDNA cloud logging.
if (process.env.LOGDNA_API_KEY) {
  const logdnaWinston = require('logdna-winston');
  const logLevel = process.env.LOGDNA_LEVEL || 'info';

  logger.add(new logdnaWinston({
    level: logLevel,
    app: process.env.LOGDNA_APPNAME,
    index_meta: true,
    key: process.env.LOGDNA_API_KEY,
    ip: ip.address(),
    hostname: os.hostname()
  }));

  logger.info(`[core] Started LogDNA winston transport. Running at log level ${logLevel}.`);
}

export default logger;
