import { describe, expect, it } from 'vitest';

import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import { GiftExchangeGroupError } from '#src/domain/gift-exchange-group-error';
import { expectLeft, expectRight } from '#tests/support/either';

const emptyGroup = () => expectRight(GiftExchangeGroup.create('Family'));

const groupWithAliceAndBob = () => {
  const withAlice = expectRight(
    emptyGroup().addParticipant({ id: 'alice', name: 'Alice', exclusions: [] })
  );
  return expectRight(
    withAlice.addParticipant({ id: 'bob', name: 'Bob', exclusions: ['alice'] })
  );
};

describe('GiftExchangeGroup.create', () => {
  it('trims the name and starts with no participants', () => {
    const group = expectRight(GiftExchangeGroup.create('  Family  '));

    expect(group.name).toBe('Family');
    expect(group.participants).toEqual([]);
  });

  it.each(['', '   '])('rejects the empty name %j', (name) => {
    const failure = expectLeft(GiftExchangeGroup.create(name));

    expect(failure.type).toBe(GiftExchangeGroupError.GroupNameEmpty);
  });
});

describe('GiftExchangeGroup.addParticipant', () => {
  it('trims the name and removes duplicate exclusions', () => {
    const group = expectRight(
      emptyGroup().addParticipant({ id: 'alice', name: 'Alice', exclusions: [] })
    );

    const updated = expectRight(
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
  });

  it('rejects an empty name', () => {
    const failure = expectLeft(
      emptyGroup().addParticipant({ id: 'alice', name: '  ', exclusions: [] })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNameEmpty);
  });

  it('rejects a name already used in the group, ignoring case', () => {
    const failure = expectLeft(
      groupWithAliceAndBob().addParticipant({
        id: 'carol',
        name: ' alice ',
        exclusions: [],
      })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNameTaken);
  });

  it('rejects an exclusion that is not a member of the group', () => {
    const failure = expectLeft(
      groupWithAliceAndBob().addParticipant({
        id: 'carol',
        name: 'Carol',
        exclusions: ['unknown'],
      })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.InvalidExclusion);
  });

  it('rejects excluding the new participant themselves', () => {
    const failure = expectLeft(
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
    const failure = expectLeft(
      groupWithAliceAndBob().updateParticipant('unknown', { name: 'X' })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNotFound);
  });

  it('keeps fields that were not provided', () => {
    const renamed = expectRight(
      groupWithAliceAndBob().updateParticipant('bob', { name: 'Robert' })
    );

    expect(renamed.findParticipant('bob')).toMatchObject({
      name: 'Robert',
      exclusions: ['alice'],
    });

    const reExcluded = expectRight(
      groupWithAliceAndBob().updateParticipant('bob', { exclusions: [] })
    );

    expect(reExcluded.findParticipant('bob')).toMatchObject({
      name: 'Bob',
      exclusions: [],
    });
  });

  it("rejects renaming to another participant's name", () => {
    const failure = expectLeft(
      groupWithAliceAndBob().updateParticipant('bob', { name: 'ALICE' })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNameTaken);
  });

  it('allows changing the case of their own name', () => {
    const updated = expectRight(
      groupWithAliceAndBob().updateParticipant('bob', { name: 'BOB' })
    );

    expect(updated.findParticipant('bob')?.name).toBe('BOB');
  });

  it('rejects excluding themselves', () => {
    const failure = expectLeft(
      groupWithAliceAndBob().updateParticipant('alice', {
        exclusions: ['alice'],
      })
    );

    expect(failure.type).toBe(GiftExchangeGroupError.InvalidExclusion);
  });
});

describe('GiftExchangeGroup.removeParticipant', () => {
  it('returns not found for an unknown participant', () => {
    const failure = expectLeft(
      groupWithAliceAndBob().removeParticipant('unknown')
    );

    expect(failure.type).toBe(GiftExchangeGroupError.ParticipantNotFound);
  });

  it("removes the participant and clears them from others' exclusions", () => {
    const group = expectRight(
      groupWithAliceAndBob().updateParticipant('alice', { exclusions: ['bob'] })
    );

    const updated = expectRight(group.removeParticipant('bob'));

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

    expect(structuredClone(group)).toEqual(snapshot);
  });
});
