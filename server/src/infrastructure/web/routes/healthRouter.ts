import { Router } from 'express';
import Dependencies from '#src/application/Dependencies';

import healthController from '#src/infrastructure/web/controllers/healthController';

const healthRouter = (dependencies: Dependencies) => {
  const controller = healthController(dependencies);
  const router = Router();
  router.route('/').get(controller.getHealth);
  return router;
};

export default healthRouter;
