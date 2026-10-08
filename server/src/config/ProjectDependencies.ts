import Dependencies from '#src/application/Dependencies';
import winstonLogger from '#src/frameworks/logger/winstonLogger';
import mongoConnect from '#src/frameworks/persistance/mongoDB/connect';
import MongoGifterRepository from '#src/frameworks/persistance/mongoDB/repositories/MongoGifterRepository';

export default async (): Promise<Dependencies> => {
  const logger = winstonLogger();
  await mongoConnect(logger);
  return {
    logger,
    gifterRepository: new MongoGifterRepository(),
  };
};
