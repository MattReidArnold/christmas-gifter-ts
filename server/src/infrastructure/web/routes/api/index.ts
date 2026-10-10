import { Router } from 'express';

import WebContext from '#src/infrastructure/web/web-context';
import groupRouter from './group-router';

const apiRouter = (context: WebContext) => {
  const router = Router();
  router.use('/groups', groupRouter(context));
  return router;
};

export default apiRouter;
