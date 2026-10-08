import mongoose from 'mongoose';
import Logger from '#src/application/ports/Logger';
import { env } from '#src/main/env';

const mongoConnect = (logger: Logger) => {
  return mongoose
    .connect(env.MONGODB_URI)
    .then(() => logger.info('Connected to MongoDB'));
};

export default mongoConnect;
