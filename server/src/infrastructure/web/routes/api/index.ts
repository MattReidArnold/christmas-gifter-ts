import { Router } from 'express';

import WebContext from '#src/infrastructure/web/web-context';
import groupRouter from './group-router';
import projectRouter from './project-router';

const apiRouter = (context: WebContext) => {
  const router = Router();
  router.use('/groups', groupRouter(context));
  router.use('/projects', projectRouter(context));
  return router;
};

export default apiRouter;
