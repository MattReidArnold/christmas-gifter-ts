import { Router } from 'express';

import Dependencies from '../../../../application/Dependencies';
import gifterRouter from './gifterRouter';

const apiRouter = (dependencies: Dependencies) => {
  const router = Router();
  router.use('/gifters', gifterRouter(dependencies));
  return router;
};

export default apiRouter;
