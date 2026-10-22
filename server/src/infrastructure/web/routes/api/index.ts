import { Router } from 'express';

import devSessionController from '#src/infrastructure/web/controllers/dev-session-controller';
import { requireSession } from '#src/infrastructure/web/require-session';
import WebContext from '#src/infrastructure/web/web-context';
import groupRouter from './group-router.js';

const apiRouter = (context: WebContext) => {
  const router = Router();
  if (process.env.NODE_ENV !== 'production') {
    router.post('/dev/session', devSessionController(context.auth).create);
  }
  router.use('/groups', requireSession(context.auth), groupRouter(context));
  return router;
};

export default apiRouter;
