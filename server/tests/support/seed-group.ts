import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import { expectOk } from '#tests/support/result';

type SeedParticipant = { id: string; name: string; exclusions?: string[] };

export const seedGroup = async (
  repository: GiftExchangeGroupRepository,
  participants: SeedParticipant[] = [],
  name = 'Family'
): Promise<GiftExchangeGroup> => {
  let group = expectOk(GiftExchangeGroup.create(name));
  for (const { id, name: participantName, exclusions = [] } of participants) {
    group = expectOk(
      group.addParticipant({ id, name: participantName, exclusions })
    );
  }
  return repository.add(group);
};
