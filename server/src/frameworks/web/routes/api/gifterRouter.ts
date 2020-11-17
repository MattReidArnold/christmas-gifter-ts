import { Router } from 'express';

import Dependencies from '../../../../application/Dependencies';
import gifterController from '../../../../controllers/gifterController';

export default (dependencies: Dependencies) => {
  const controller = gifterController(dependencies);
  const router = Router();
  router.post('/', controller.createGifter);
  return router;
};
