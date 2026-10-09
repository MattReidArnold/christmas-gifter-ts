import { Router } from 'express';

import WebContext from '#src/infrastructure/web/web-context';
import gifterRouter from './gifter-router';

const apiRouter = (context: WebContext) => {
  const router = Router();
  router.use('/gifters', gifterRouter(context));
  return router;
};

export default apiRouter;
