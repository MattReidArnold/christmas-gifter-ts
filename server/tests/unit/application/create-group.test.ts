import { beforeEach, describe, expect, it, vi } from 'vitest';

import createGroup from '#src/application/use-cases/create-group';
import { GiftExchangeGroupError } from '#src/domain/gift-exchange-group-error';
import { expectLeft, expectRight } from '#tests/support/either';
import InMemoryGroupRepository from '#tests/support/in-memory-group-repository';

describe('createGroup', () => {
  let groupRepository: InMemoryGroupRepository;

  beforeEach(() => {
    groupRepository = new InMemoryGroupRepository();
  });

  it('saves a new group and returns it with an id', async () => {
    const group = expectRight(
      await createGroup({ groupRepository }).execute('  Family  ')
    );

    expect(group.id).toBeDefined();
    expect(group.name).toBe('Family');
    expect(await groupRepository.getById(group.id ?? '')).toEqual(group);
  });

  it('returns the domain failure without saving', async () => {
    const add = vi.spyOn(groupRepository, 'add');

    const failure = expectLeft(
      await createGroup({ groupRepository }).execute('   ')
    );

    expect(failure.type).toBe(GiftExchangeGroupError.GroupNameEmpty);
    expect(add).not.toHaveBeenCalled();
  });
});
