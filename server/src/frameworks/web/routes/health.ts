import { Router } from 'express';
import Dependencies from '../../../application/Dependencies';

import healthController from '../../../controllers/health';

export default (dependencies: Dependencies) => {
  const controller = healthController(dependencies);
  const router = Router();
  router.route('/').get(controller.getHealth);
  return router;
};
