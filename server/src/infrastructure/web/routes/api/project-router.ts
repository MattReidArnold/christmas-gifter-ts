import { Router } from 'express';

import WebContext from '#src/infrastructure/web/web-context';
import projectController from '#src/infrastructure/web/controllers/project-controller';

const projectRouter = ({ logger, useCases }: WebContext) => {
  const controller = projectController({ logger, ...useCases });
  const router = Router();
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:projectId', controller.find);
  router.put('/:projectId', controller.update);
  router.delete('/:projectId', controller.remove);
  return router;
};

export default projectRouter;
