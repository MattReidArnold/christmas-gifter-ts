import { Router } from 'express';

import Dependencies from '../../../../application/Dependencies';
import gifterRouter from './gifterRouter';

export default (dependencies: Dependencies) => {
  const router = Router();
  router.use('/gifters', gifterRouter(dependencies));
  return router;
};
