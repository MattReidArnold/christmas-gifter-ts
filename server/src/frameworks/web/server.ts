import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import router from './routes';
import Dependencies from '../../application/Dependencies';
import { env } from '../../config/env';

const port = env.PORT;

export default (dependencies: Dependencies) => {
  const app = express();

  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(router(dependencies));

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};
