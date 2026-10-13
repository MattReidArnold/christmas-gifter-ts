import { Router } from 'express';

import WebContext from '#src/infrastructure/web/web-context';
import groupController from '#src/infrastructure/web/controllers/group-controller';

const groupRouter = ({ logger, useCases }: WebContext) => {
  const controller = groupController({ logger, ...useCases });
  const router = Router();
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:groupId', controller.find);
  router.delete('/:groupId', controller.remove);
  router.post('/:groupId/participants', controller.addMember);
  router.put('/:groupId/participants/:participantId', controller.updateMember);
  router.delete(
    '/:groupId/participants/:participantId',
    controller.removeMember
  );
  return router;
};

export default groupRouter;
