import { createLogger, transports, format } from 'winston';

export default () => {
  //TODO: Fix logger so that things like logger.info(a, b, c, ...) works
  const logger = createLogger({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    transports: [new transports.Console()],
  });
  return logger;
};
