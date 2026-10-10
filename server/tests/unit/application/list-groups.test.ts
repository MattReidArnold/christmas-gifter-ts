import { beforeEach, describe, expect, it } from 'vitest';

import listGroups from '#src/application/use-cases/list-groups';
import InMemoryGroupRepository from '#tests/support/in-memory-group-repository';
import { seedGroup } from '#tests/support/seed-group';

describe('listGroups', () => {
  let groupRepository: InMemoryGroupRepository;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
  });

  it('returns an empty list when there are no groups', async () => {
    expect(await listGroups({ groupRepository }).execute()).toEqual([]);
  });

  it('returns every saved group', async () => {
    const family = await seedGroup(groupRepository, [], 'Family');
    const friends = await seedGroup(groupRepository, [], 'Friends');

    expect(await listGroups({ groupRepository }).execute()).toEqual([
      family,
      friends,
    ]);
  });
});
