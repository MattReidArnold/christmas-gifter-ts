import express from 'express';
import morgan from 'morgan';

import router from './routes';
import Dependencies from '#src/application/Dependencies';

const server = (dependencies: Dependencies, port: number) => {
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
