import express from 'express';
import morgan from 'morgan';

import router from './routes';
import Dependencies from '#src/application/Dependencies';
import { env } from '#src/main/env';

const port = env.PORT;

const server = (dependencies: Dependencies) => {
  const app = express();

  app.use(morgan('dev'));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(router(dependencies));

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

export default server;
