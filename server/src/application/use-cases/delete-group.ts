import { Failure } from '#src/domain/shared/failure';
import { Result, err, ok } from '#src/domain/shared/result';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import {
  GroupUseCaseError,
  groupNotFoundFailure,
} from '#src/application/use-cases/group-failures';

type DeleteGroupResult = Result<void, Failure<GroupUseCaseError.GroupNotFound>>;

type DeleteGroupDeps = {
  groupRepository: GiftExchangeGroupRepository;
};

const deleteGroup = ({ groupRepository }: DeleteGroupDeps) => {
  const execute = async (groupId: string): Promise<DeleteGroupResult> => {
    const deleted = await groupRepository.delete(groupId);
    return deleted ? ok(undefined) : err(groupNotFoundFailure());
  };

  return {
    execute,
  };
};

export type DeleteGroupUseCase = ReturnType<typeof deleteGroup>;

export default deleteGroup;
