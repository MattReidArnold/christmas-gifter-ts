import mongoose from 'mongoose';
import Logger from '#src/application/ports/logger';

const mongoConnect = (logger: Logger, uri: string) => {
  return mongoose
    .connect(uri)
    .then(() => logger.info('Connected to MongoDB'));
};

export default mongoConnect;
