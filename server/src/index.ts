import mongoose from 'mongoose';

import createAuth from '#src/infrastructure/auth/better-auth';
import app from '#src/infrastructure/web/server';
import dependencies from '#src/main/dependencies';
import { env } from '#src/main/env';
import useCases from '#src/main/use-cases';

dependencies().then((deps) => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection is missing a database');
  }
  app(
    { logger: deps.logger, useCases: useCases(deps), auth: createAuth(db) },
    env.PORT
  );
});
