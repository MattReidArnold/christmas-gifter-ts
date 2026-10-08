import Dependencies from '#src/application/Dependencies';
import winstonLogger from '#src/infrastructure/logger/winstonLogger';
import mongoConnect from '#src/infrastructure/persistence/mongoDB/connect';
import MongoGifterRepository from '#src/infrastructure/persistence/mongoDB/repositories/MongoGifterRepository';
import { env } from '#src/main/env';

export default async (): Promise<Dependencies> => {
  const logger = winstonLogger();
  await mongoConnect(logger, env.MONGODB_URI);
  return {
    logger,
    gifterRepository: new MongoGifterRepository(),
  };
};
