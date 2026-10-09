import { Router } from 'express';

import WebContext from '#src/infrastructure/web/web-context';
import gifterController from '#src/infrastructure/web/controllers/gifter-controller';

const gifterRouter = ({ logger, useCases }: WebContext) => {
  const controller = gifterController({ logger, ...useCases });
  const router = Router();
  router.post('/', controller.create);
  router.get('/:id', controller.find);
  router.put('/:id', controller.update);
  return router;
};

export default gifterRouter;
