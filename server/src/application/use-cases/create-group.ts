import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import { GiftExchangeGroupError } from '#src/domain/gift-exchange-group-error';
import { Failure } from '#src/domain/shared/failure';
import { Result, ok } from '#src/domain/shared/result';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';

type CreateGroupResult = Result<
  GiftExchangeGroup,
  Failure<GiftExchangeGroupError.GroupNameEmpty>
>;

type CreateGroupDeps = {
  groupRepository: GiftExchangeGroupRepository;
};

const createGroup = ({ groupRepository }: CreateGroupDeps) => {
  const execute = async (
    name: string,
    ownerId: string
  ): Promise<CreateGroupResult> => {
    const result = GiftExchangeGroup.create(name, ownerId);
    if (!result.ok) {
      return result;
    }
    return ok(await groupRepository.add(result.value));
  };

  return {
    execute,
  };
};

export type CreateGroupUseCase = ReturnType<typeof createGroup>;

export default createGroup;
