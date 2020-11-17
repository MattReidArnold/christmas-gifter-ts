import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import router from './routes';
import Dependencies from '../../application/Dependencies';

export default (dependencies: Dependencies) => {
  const port = process.env.PORT || 3000;

  const app = express();

  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(router(dependencies));

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};
