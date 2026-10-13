import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import { Failure } from '#src/domain/shared/failure';
import { Result, err, ok } from '#src/domain/shared/result';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import {
  GroupUseCaseError,
  groupNotFoundFailure,
} from '#src/application/use-cases/group-failures';

type GetGroupResult = Result<
  GiftExchangeGroup,
  Failure<GroupUseCaseError.GroupNotFound>
>;

type GetGroupDeps = {
  groupRepository: GiftExchangeGroupRepository;
};

const getGroup = ({ groupRepository }: GetGroupDeps) => {
  const execute = async (groupId: string): Promise<GetGroupResult> => {
    const group = await groupRepository.getById(groupId);
    return group ? ok(group) : err(groupNotFoundFailure());
  };

  return {
    execute,
  };
};

export type GetGroupUseCase = ReturnType<typeof getGroup>;

export default getGroup;
