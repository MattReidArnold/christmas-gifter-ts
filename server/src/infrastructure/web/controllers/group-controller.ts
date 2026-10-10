import { Request, Response, NextFunction } from 'express';

import { GiftExchangeGroupError } from '#src/domain/gift-exchange-group-error';
import { Failure } from '#src/domain/shared/failure';
import Logger from '#src/application/ports/logger';
import { AddParticipantUseCase } from '#src/application/use-cases/add-participant';
import { CreateGroupUseCase } from '#src/application/use-cases/create-group';
import { DeleteGroupUseCase } from '#src/application/use-cases/delete-group';
import { GetGroupUseCase } from '#src/application/use-cases/get-group';
import { GroupUseCaseError } from '#src/application/use-cases/group-failures';
import { RemoveParticipantUseCase } from '#src/application/use-cases/remove-participant';
import { UpdateParticipantUseCase } from '#src/application/use-cases/update-participant';

type GroupControllerDeps = {
  logger: Logger;
  createGroup: CreateGroupUseCase;
  getGroup: GetGroupUseCase;
  deleteGroup: DeleteGroupUseCase;
  addParticipant: AddParticipantUseCase;
  updateParticipant: UpdateParticipantUseCase;
  removeParticipant: RemoveParticipantUseCase;
};

type GroupParams = { groupId: string };
type ParticipantParams = { groupId: string; participantId: string };

type GroupFailure = Failure<GroupUseCaseError | GiftExchangeGroupError>;

const statusForFailure = ({ type }: GroupFailure): number => {
  switch (type) {
    case GroupUseCaseError.GroupNotFound:
    case GiftExchangeGroupError.ParticipantNotFound:
      return 404;
    case GroupUseCaseError.GroupSaveFailed:
      return 500;
    default:
      return 422;
  }
};

const sendFailure = (res: Response, failure: GroupFailure) =>
  res.status(statusForFailure(failure)).send({ failure });

const stringOrUndefined = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const stringArrayOrUndefined = (value: unknown): string[] | undefined =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : undefined;

const groupController = ({
  logger,
  createGroup,
  getGroup,
  deleteGroup,
  addParticipant,
  updateParticipant,
  removeParticipant,
}: GroupControllerDeps) => {
  const create = async (req: Request, res: Response, _next: NextFunction) => {
    const name = stringOrUndefined(req.body?.name) ?? '';
    const result = await createGroup.execute(name);
    if (result.isLeft()) {
      logger.info('failed to create group', JSON.stringify(result.value));
      return sendFailure(res, result.value);
    }
    const group = result.value;
    logger.info('group created', JSON.stringify(group));
    return res.status(201).send(group);
  };

  const find = async (
    req: Request<GroupParams>,
    res: Response,
    _next: NextFunction
  ) => {
    const result = await getGroup.execute(req.params.groupId);
    if (result.isLeft()) {
      return sendFailure(res, result.value);
    }
    return res.send(result.value);
  };

  const remove = async (
    req: Request<GroupParams>,
    res: Response,
    _next: NextFunction
  ) => {
    const { groupId } = req.params;
    const result = await deleteGroup.execute(groupId);
    if (result.isLeft()) {
      logger.info('failed to delete group', JSON.stringify(result.value));
      return sendFailure(res, result.value);
    }
    logger.info('group deleted', groupId);
    return res.status(204).send();
  };

  const addMember = async (
    req: Request<GroupParams>,
    res: Response,
    _next: NextFunction
  ) => {
    const result = await addParticipant.execute(req.params.groupId, {
      name: stringOrUndefined(req.body?.name) ?? '',
      exclusions: stringArrayOrUndefined(req.body?.exclusions) ?? [],
    });
    if (result.isLeft()) {
      logger.info('failed to add participant', JSON.stringify(result.value));
      return sendFailure(res, result.value);
    }
    return res.status(201).send(result.value);
  };

  const updateMember = async (
    req: Request<ParticipantParams>,
    res: Response,
    _next: NextFunction
  ) => {
    const { groupId, participantId } = req.params;
    const result = await updateParticipant.execute(groupId, participantId, {
      name: stringOrUndefined(req.body?.name),
      exclusions: stringArrayOrUndefined(req.body?.exclusions),
    });
    if (result.isLeft()) {
      logger.info('failed to update participant', JSON.stringify(result.value));
      return sendFailure(res, result.value);
    }
    return res.send(result.value);
  };

  const removeMember = async (
    req: Request<ParticipantParams>,
    res: Response,
    _next: NextFunction
  ) => {
    const { groupId, participantId } = req.params;
    const result = await removeParticipant.execute(groupId, participantId);
    if (result.isLeft()) {
      logger.info('failed to remove participant', JSON.stringify(result.value));
      return sendFailure(res, result.value);
    }
    return res.send(result.value);
  };

  return {
    create,
    find,
    remove,
    addMember,
    updateMember,
    removeMember,
  };
};

export default groupController;
