import Dependencies from '../application/Dependencies';
import winstonLogger from '../frameworks/logger/winstonLogger';
import mongoConnect from '../frameworks/persistance/mongoDB/connect';
import MongoGifterRepository from '../frameworks/persistance/mongoDB/repositories/MongoGifterRepository';

export default async (): Promise<Dependencies> => {
  const logger = winstonLogger();
  await mongoConnect(logger);
  return {
    logger,
    gifterRepository: new MongoGifterRepository(),
  };
};
