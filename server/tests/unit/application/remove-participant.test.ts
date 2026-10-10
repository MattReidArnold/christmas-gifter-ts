import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupUseCaseError } from '#src/application/use-cases/group-failures';
import removeParticipant from '#src/application/use-cases/remove-participant';
import { GiftExchangeGroupError } from '#src/domain/gift-exchange-group-error';
import { expectLeft, expectRight } from '#tests/support/either';
import InMemoryGroupRepository from '#tests/support/in-memory-group-repository';
import { seedGroup } from '#tests/support/seed-group';

describe('removeParticipant', () => {
  let groupRepository: InMemoryGroupRepository;
  let useCase: ReturnType<typeof removeParticipant>;
  let groupId: string;

  beforeEach(async () => {
    groupRepository = new InMemoryGroupRepository();
    useCase = removeParticipant({ groupRepository });
    const group = await seedGroup(groupRepository, [
      { id: 'alice', name: 'Alice' },
      { id: 'bob', name: 'Bob', exclusions: ['alice'] },
    ]);
    groupId = group.id ?? '';
  });

  it('removes the participant and saves the group', async () => {
    const group = expectRight(await useCase.execute(groupId, 'alice'));

    expect(group.findParticipant('alice')).toBeUndefined();
    expect(group.findParticipant('bob')?.exclusions).toEqual([]);
    expect(await groupRepository.getById(groupId)).toEqual(group);
  });

  it('returns not found for an unknown group', async () => {
    const failure = expectLeft(await useCase.execute('missing', 'alice'));

    expect(failure.type).toBe(GroupUseCaseError.GroupNotFound);
  });

  it('returns the domain failure without saving', async () => {
    const update = vi.spyOn(groupRepository, 'update');

    const failure = expectLeft(await useCase.execute(groupId, 'unknown'));

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNotFound);
    expect(update).not.toHaveBeenCalled();
  });

  it('returns save failed when the group cannot be saved', async () => {
    vi.spyOn(groupRepository, 'update').mockResolvedValue(null);

    const failure = expectLeft(await useCase.execute(groupId, 'alice'));

    expect(failure.type).toBe(GroupUseCaseError.GroupSaveFailed);
  });
});
