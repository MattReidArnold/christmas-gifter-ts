import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import { GiftExchangeGroupError } from '#src/domain/gift-exchange-group-error';
import { Either, left, right } from '#src/domain/shared/either';
import { Failure } from '#src/domain/shared/failure';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';

type CreateGroupResult = Either<
  Failure<GiftExchangeGroupError.GroupNameEmpty>,
  GiftExchangeGroup
>;

type CreateGroupDeps = {
  groupRepository: GiftExchangeGroupRepository;
};

const createGroup = ({ groupRepository }: CreateGroupDeps) => {
  const execute = async (name: string): Promise<CreateGroupResult> => {
    const result = GiftExchangeGroup.create(name);
    if (result.isLeft()) {
      return left(result.value);
    }
    return right(await groupRepository.add(result.value));
  };

  return {
    execute,
  };
};

export type CreateGroupUseCase = ReturnType<typeof createGroup>;

export default createGroup;
