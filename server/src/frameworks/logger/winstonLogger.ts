import { createLogger, transports, format } from 'winston';

export default () => {
  const logger = createLogger({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    transports: [new transports.Console()],
  });
  const stringify = (args: any[]) => args.join(' ');

  const info = (...args: any[]) => {
    logger.info(stringify(args));
  };

  const warn = (...args: any[]) => {
    logger.warn(stringify(args));
  };

  const error = (...args: any[]) => {
    logger.error(stringify(args));
  };

  return {
    info,
    warn,
    error,
  };
};
