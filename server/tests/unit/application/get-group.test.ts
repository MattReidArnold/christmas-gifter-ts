import { beforeEach, describe, expect, it } from 'vitest';

import getGroup from '#src/application/use-cases/get-group';
import { GroupUseCaseError } from '#src/application/use-cases/group-failures';
import { expectLeft, expectRight } from '#tests/support/either';
import InMemoryGroupRepository from '#tests/support/in-memory-group-repository';
import { seedGroup } from '#tests/support/seed-group';

describe('getGroup', () => {
  let groupRepository: InMemoryGroupRepository;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
  });

  it('returns the group', async () => {
    const seeded = await seedGroup(groupRepository, [
      { id: 'alice', name: 'Alice' },
    ]);

    const group = expectRight(
      await getGroup({ groupRepository }).execute(seeded.id ?? '')
    );

    expect(group).toEqual(seeded);
  });

  it('returns not found for an unknown group', async () => {
    const failure = expectLeft(
      await getGroup({ groupRepository }).execute('missing')
    );

    expect(failure.type).toBe(GroupUseCaseError.GroupNotFound);
  });
});
