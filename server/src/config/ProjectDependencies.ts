import Dependencies from '../application/Dependencies';
import winstonLogger from '../frameworks/logger/winstonLogger';

export default (): Dependencies => {
  return {
    logger: winstonLogger,
  };
};
