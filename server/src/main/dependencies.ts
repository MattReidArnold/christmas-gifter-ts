import Dependencies from '#src/application/Dependencies';
import winstonLogger from '#src/infrastructure/logger/winstonLogger';
import mongoConnect from '#src/infrastructure/persistence/mongoDB/connect';
import MongoGifterRepository from '#src/infrastructure/persistence/mongoDB/repositories/MongoGifterRepository';

export default async (): Promise<Dependencies> => {
  const logger = winstonLogger();
  await mongoConnect(logger);
  return {
    logger,
    gifterRepository: new MongoGifterRepository(),
  };
};
