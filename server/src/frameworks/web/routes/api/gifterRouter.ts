import { Router } from 'express';

import Dependencies from '#src/application/Dependencies';
import gifterController from '#src/controllers/gifterController';

const gifterRouter = (dependencies: Dependencies) => {
  const controller = gifterController(dependencies);
  const router = Router();
  router.post('/', controller.createGifter);
  router.get('/:id', controller.findGifter);
  router.put('/:id', controller.updateGifter);
  return router;
};

export default gifterRouter;
