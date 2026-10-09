import { Router } from 'express';
import WebContext from '#src/infrastructure/web/web-context';

import healthController from '#src/infrastructure/web/controllers/health-controller';

const healthRouter = ({ logger }: WebContext) => {
  const controller = healthController({ logger });
  const router = Router();
  router.route('/').get(controller.getHealth);
  return router;
};

export default healthRouter;
