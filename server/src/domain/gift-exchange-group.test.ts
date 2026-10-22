import { describe, expect, it } from 'vitest';

import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import { GiftExchangeGroupError } from '#src/domain/gift-exchange-group-error';
import { expectErr, expectOk } from '#tests/support/result';

const ownerId = 'owner-1';

const emptyGroup = () => expectOk(GiftExchangeGroup.create('Family', ownerId));

const groupWithAliceAndBob = () => {
  const withAlice = expectOk(
    emptyGroup().addParticipant({ id: 'alice', name: 'Alice', exclusions: [] })
  );
  return expectOk(
    withAlice.addParticipant({ id: 'bob', name: 'Bob', exclusions: ['alice'] })
  );
};

describe('GiftExchangeGroup.create', () => {
  it('trims the name and starts with no participants', () => {
    const group = expectOk(GiftExchangeGroup.create('  Family  ', `  ${ownerId}  `));

    expect(group.name).toBe('Family');
    expect(group.participants).toEqual([]);
    expect(group.members).toEqual([{ userId: ownerId, role: 'owner' }]);
  });

  it.each(['', '   '])('rejects the empty name %j', (name) => {
    const failure = expectErr(GiftExchangeGroup.create(name, ownerId));

    expect(failure.type).toBe(GiftExchangeGroupError.GroupNameEmpty);
  });
});

describe('GiftExchangeGroup.rename', () => {
  it('trims the new name and keeps the id and participants', () => {
    const group = new GiftExchangeGroup({
      id: 'group-1',
      name: 'Family',
      participants: groupWithAliceAndBob().participants,
      members: [{ userId: ownerId, role: 'owner' }],
    });

    const renamed = expectOk(group.rename('  Friends  '));

    expect(renamed.id).toBe('group-1');
    expect(renamed.name).toBe('Friends');
    expect(renamed.participants).toEqual(group.participants);
    expect(renamed.members).toEqual(group.members);
  });

  it.each(['', '   '])('rejects the empty name %j', (name) => {
    const failure = expectErr(emptyGroup().rename(name));

    expect(failure.type).toBe(GiftExchangeGroupError.GroupNameEmpty);
  });
});

describe('GiftExchangeGroup.addParticipant', () => {
  it('trims the name and removes duplicate exclusions', () => {
    const group = expectOk(
      emptyGroup().addParticipant({ id: 'alice', name: 'Alice', exclusions: [] })
    );

    const updated = expectOk(
      group.addParticipant({
        id: 'bob',
        name: '  Bob  ',
        exclusions: ['alice', 'alice'],
      })
    );

    expect(updated.findParticipant('bob')).toMatchObject({
      name: 'Bob',
      exclusions: ['alice'],
    });
    expect(updated.members).toEqual(group.members);
  });

  it('rejects an empty name', () => {
    const failure = expectErr(
      emptyGroup().addParticipant({ id: 'alice', name: '  ', exclusions: [] })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNameEmpty);
  });

  it('rejects a name already used in the group, ignoring case', () => {
    const failure = expectErr(
      groupWithAliceAndBob().addParticipant({
        id: 'carol',
        name: ' alice ',
        exclusions: [],
      })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNameTaken);
  });

  it('rejects an exclusion that is not a member of the group', () => {
    const failure = expectErr(
      groupWithAliceAndBob().addParticipant({
        id: 'carol',
        name: 'Carol',
        exclusions: ['unknown'],
      })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.InvalidExclusion);
  });

  it('rejects excluding the new participant themselves', () => {
    const failure = expectErr(
      groupWithAliceAndBob().addParticipant({
        id: 'carol',
        name: 'Carol',
        exclusions: ['carol'],
      })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.InvalidExclusion);
  });
});

describe('GiftExchangeGroup.updateParticipant', () => {
  it('returns not found for an unknown participant', () => {
    const failure = expectErr(
      groupWithAliceAndBob().updateParticipant('unknown', { name: 'X' })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNotFound);
  });

  it('keeps fields that were not provided', () => {
    const renamed = expectOk(
      groupWithAliceAndBob().updateParticipant('bob', { name: 'Robert' })
    );

    expect(renamed.findParticipant('bob')).toMatchObject({
      name: 'Robert',
      exclusions: ['alice'],
    });

    const reExcluded = expectOk(
      groupWithAliceAndBob().updateParticipant('bob', { exclusions: [] })
    );

    expect(reExcluded.findParticipant('bob')).toMatchObject({
      name: 'Bob',
      exclusions: [],
    });
  });

  it("rejects renaming to another participant's name", () => {
    const failure = expectErr(
      groupWithAliceAndBob().updateParticipant('bob', { name: 'ALICE' })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNameTaken);
  });

  it('allows changing the case of their own name', () => {
    const updated = expectOk(
      groupWithAliceAndBob().updateParticipant('bob', { name: 'BOB' })
    );

    expect(updated.findParticipant('bob')?.name).toBe('BOB');
  });

  it('rejects excluding themselves', () => {
    const failure = expectErr(
      groupWithAliceAndBob().updateParticipant('alice', {
        exclusions: ['alice'],
      })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.InvalidExclusion);
  });
});

describe('GiftExchangeGroup.removeParticipant', () => {
  it('returns not found for an unknown participant', () => {
    const failure = expectErr(
      groupWithAliceAndBob().removeParticipant('unknown')
    );

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNotFound);
  });

  it("removes the participant and clears them from others' exclusions", () => {
    const group = expectOk(
      groupWithAliceAndBob().updateParticipant('alice', { exclusions: ['bob'] })
    );

    const updated = expectOk(group.removeParticipant('bob'));

    expect(updated.participants.map(({ id }) => id)).toEqual(['alice']);
    expect(updated.findParticipant('alice')?.exclusions).toEqual([]);
  });
});

describe('GiftExchangeGroup immutability', () => {
  it('leaves the original group unchanged after every operation', () => {
    const group = groupWithAliceAndBob();
    const snapshot = structuredClone(group);

    group.addParticipant({ id: 'carol', name: 'Carol', exclusions: ['alice'] });
    group.updateParticipant('bob', { name: 'Robert', exclusions: [] });
    group.removeParticipant('alice');
    group.rename('Friends');

    expect(structuredClone(group)).toEqual(snapshot);
  });
});
