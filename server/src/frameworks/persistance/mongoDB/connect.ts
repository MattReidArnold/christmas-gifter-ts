import mongoose from 'mongoose';
import Logger from '../../../application/Logger';
import { env } from '../../../config/env';

export default (logger: Logger) => {
  return mongoose
    .connect(env.MONGODB_URI)
    .then(() => logger.info('Connected to MongoDB'));
};
