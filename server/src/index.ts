import mongoose from 'mongoose';

import createAuth from './infrastructure/auth/better-auth.js';
import app from './infrastructure/web/server.js';
import dependencies from './main/dependencies.js';
import { env } from './main/env.js';
import useCases from './main/use-cases.js';

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
