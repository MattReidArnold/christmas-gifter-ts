import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';

type ListGroupsDeps = {
  groupRepository: GiftExchangeGroupRepository;
};

const listGroups = ({ groupRepository }: ListGroupsDeps) => {
  const execute = (): Promise<GiftExchangeGroup[]> => groupRepository.getAll();

  return {
    execute,
  };
};

export type ListGroupsUseCase = ReturnType<typeof listGroups>;

export default listGroups;
