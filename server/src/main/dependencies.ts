import Dependencies from '#src/application/dependencies';
import winstonLogger from '#src/infrastructure/logger/winston-logger';
import mongoConnect from '#src/infrastructure/persistence/mongodb/connect';
import MongoGifterRepository from '#src/infrastructure/persistence/mongodb/repositories/mongo-gifter-repository';
import { env } from '#src/main/env';

export default async (): Promise<Dependencies> => {
  const logger = winstonLogger();
  await mongoConnect(logger, env.MONGODB_URI);
  return {
    logger,
    gifterRepository: new MongoGifterRepository(),
  };
};
