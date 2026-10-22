import { toNodeHandler } from 'better-auth/node';
import express from 'express';
import morgan from 'morgan';

import router from '#src/infrastructure/web/routes/index';
import WebContext from '#src/infrastructure/web/web-context';

const server = (context: WebContext, port: number) => {
  const app = express();

  app.use(morgan('dev'));
  // Better Auth reads the raw body, so it is mounted before the body parsers.
  // Express 5 names the wildcard *splat.
  app.all('/api/auth/*splat', toNodeHandler(context.auth));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(router(context));

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

export default server;
