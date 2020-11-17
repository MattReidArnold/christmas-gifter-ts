import mongoose from 'mongoose';
import Logger from '../../../application/Logger';

export default (logger: Logger) => {
  // If deployed, use the deployed database. Otherwise use the local mongo database
  var MONGODB_URI =
    process.env.MONGODB_URI ||
    'mongodb://devUser:Password123@localhost:27017/dev';

  return mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => logger.info('Connected to MongoDB'));
};
