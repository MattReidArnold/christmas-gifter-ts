import { Either, left, right } from '#src/domain/shared/either';
import { Failure } from '#src/domain/shared/failure';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import {
  GroupUseCaseError,
  groupNotFoundFailure,
} from '#src/application/use-cases/group-failures';

type DeleteGroupResult = Either<Failure<GroupUseCaseError.GroupNotFound>, void>;

type DeleteGroupDeps = {
  groupRepository: GiftExchangeGroupRepository;
};

const deleteGroup = ({ groupRepository }: DeleteGroupDeps) => {
  const execute = async (groupId: string): Promise<DeleteGroupResult> => {
    const deleted = await groupRepository.delete(groupId);
    if (!deleted) {
      return left(groupNotFoundFailure());
    }
    return right(undefined);
  };

  return {
    execute,
  };
};

export type DeleteGroupUseCase = ReturnType<typeof deleteGroup>;

export default deleteGroup;
