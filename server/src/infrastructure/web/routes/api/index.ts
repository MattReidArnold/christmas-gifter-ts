import { Router } from 'express';

import Dependencies from '#src/application/Dependencies';
import gifterRouter from './gifterRouter';

const apiRouter = (dependencies: Dependencies) => {
  const router = Router();
  router.use('/gifters', gifterRouter(dependencies));
  return router;
};

export default apiRouter;
