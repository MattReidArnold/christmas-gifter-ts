import { beforeEach, describe, expect, it } from 'vitest';

import deleteGroup from '#src/application/use-cases/delete-group';
import { GroupUseCaseError } from '#src/application/use-cases/group-failures';
import { expectErr, expectOk } from '#tests/support/result';
import InMemoryGroupRepository from '#tests/support/in-memory-group-repository';
import { seedGroup } from '#tests/support/seed-group';

describe('deleteGroup', () => {
  let groupRepository: InMemoryGroupRepository;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
  });

  it('deletes the group', async () => {
    const { id = '' } = await seedGroup(groupRepository);

    expectOk(await deleteGroup({ groupRepository }).execute(id));

    expect(await groupRepository.getById(id)).toBeNull();
  });

  it('returns not found for an unknown group', async () => {
    const failure = expectErr(
      await deleteGroup({ groupRepository }).execute('missing')
    );

    expect(failure.type).toBe(GroupUseCaseError.GroupNotFound);
  });
});
