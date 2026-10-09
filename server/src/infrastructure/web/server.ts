import express from 'express';
import morgan from 'morgan';

import router from './routes';
import WebContext from './web-context';

const server = (context: WebContext, port: number) => {
  const app = express();

  app.use(morgan('dev'));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(router(context));

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

export default server;
