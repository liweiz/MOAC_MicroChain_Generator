const { createLogger, format, transports } = require('winston');
const moment = require('moment-timezone');

const logFormat = format.printf(
  info => `${info.level}[${info.timestamp}]:  ${info.message}`
);

const logTimestamp = format((info, opts) => {
  if (opts.tz) {
    info.timestamp = moment()
      .tz(opts.tz)
      .format();
  }
  return info;
});

module.exports = () => {
  return createLogger({
    level: 'info',
    transports: [new transports.Console()],
    format: format.combine(logTimestamp({ tz: 'America/Toronto' }), logFormat)
  });
};
