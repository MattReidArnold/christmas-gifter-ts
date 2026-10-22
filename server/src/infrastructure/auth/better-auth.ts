import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import type { Db } from 'mongodb';

import { env } from '#src/main/env';

const createAuth = (db: Db) => {
  if (!env.GOOGLE_CLIENT_ID) {
    console.warn(
      'GOOGLE_CLIENT_ID is empty, so Google sign-in is disabled. Add it to server/.env to turn it on.'
    );
  }
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.BETTER_AUTH_URL],
    database: mongodbAdapter(db),
    ...(env.GOOGLE_CLIENT_ID
      ? {
          socialProviders: {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
            },
          },
        }
      : {}),
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google'],
      },
    },
  });
};

export type Auth = ReturnType<typeof createAuth>;

export default createAuth;
