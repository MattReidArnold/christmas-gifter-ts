import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import { Either, left, right } from '#src/domain/shared/either';
import { Failure } from '#src/domain/shared/failure';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import {
  GroupUseCaseError,
  groupNotFoundFailure,
} from '#src/application/use-cases/group-failures';

type GetGroupResult = Either<
  Failure<GroupUseCaseError.GroupNotFound>,
  GiftExchangeGroup
>;

type GetGroupDeps = {
  groupRepository: GiftExchangeGroupRepository;
};

const getGroup = ({ groupRepository }: GetGroupDeps) => {
  const execute = async (groupId: string): Promise<GetGroupResult> => {
    const group = await groupRepository.getById(groupId);
    if (!group) {
      return left(groupNotFoundFailure());
    }
    return right(group);
  };

  return {
    execute,
  };
};

export type GetGroupUseCase = ReturnType<typeof getGroup>;

export default getGroup;
