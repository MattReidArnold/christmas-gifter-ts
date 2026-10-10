import Participant from '#src/domain/participant';
import { Either, left, right } from '#src/domain/shared/either';
import { Failure } from '#src/domain/shared/failure';
import {
  GiftExchangeGroupError,
  ParticipantValidationError,
  groupNameEmptyFailure,
  invalidExclusionFailure,
  participantNameEmptyFailure,
  participantNameTakenFailure,
  participantNotFoundFailure,
} from '#src/domain/gift-exchange-group-error';

export interface GiftExchangeGroupParams {
  id?: string;
  name: string;
  participants: Participant[];
}

export interface NewParticipant {
  id: string;
  name: string;
  exclusions: string[];
}

export interface ParticipantChanges {
  name?: string;
  exclusions?: string[];
}

type ParticipantResult = Either<
  Failure<ParticipantValidationError>,
  GiftExchangeGroup
>;

type ExistingParticipantResult = Either<
  Failure<GiftExchangeGroupError.ParticipantNotFound | ParticipantValidationError>,
  GiftExchangeGroup
>;

export default class GiftExchangeGroup {
  readonly id?: string;
  readonly name: string;
  readonly participants: Participant[];

  // Rehydrates an existing group without validation; use `create` for new groups.
  constructor({ id, name, participants }: GiftExchangeGroupParams) {
    this.id = id;
    this.name = name;
    this.participants = participants;
  }

  static create(
    name: string
  ): Either<Failure<GiftExchangeGroupError.GroupNameEmpty>, GiftExchangeGroup> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return left(groupNameEmptyFailure());
    }
    return right(new GiftExchangeGroup({ name: trimmedName, participants: [] }));
  }

  findParticipant(participantId: string): Participant | undefined {
    return this.participants.find(({ id }) => id === participantId);
  }

  addParticipant({ id, name, exclusions }: NewParticipant): ParticipantResult {
    const participant = new Participant({
      id,
      name: name.trim(),
      exclusions: unique(exclusions),
    });
    return this.withValidParticipant(participant, [
      ...this.participants,
      participant,
    ]);
  }

  updateParticipant(
    participantId: string,
    { name, exclusions }: ParticipantChanges
  ): ExistingParticipantResult {
    const existing = this.findParticipant(participantId);
    if (!existing) {
      return left(participantNotFoundFailure());
    }
    const participant = new Participant({
      id: existing.id,
      name: name?.trim() ?? existing.name,
      exclusions: exclusions ? unique(exclusions) : existing.exclusions,
    });
    return this.withValidParticipant(
      participant,
      this.participants.map((p) => (p.id === participant.id ? participant : p))
    );
  }

  removeParticipant(
    participantId: string
  ): Either<Failure<GiftExchangeGroupError.ParticipantNotFound>, GiftExchangeGroup> {
    if (!this.findParticipant(participantId)) {
      return left(participantNotFoundFailure());
    }
    const remaining = this.participants
      .filter(({ id }) => id !== participantId)
      .map(
        (p) =>
          new Participant({
            id: p.id,
            name: p.name,
            exclusions: p.exclusions.filter((id) => id !== participantId),
          })
      );
    return right(this.withParticipants(remaining));
  }

  private withValidParticipant(
    participant: Participant,
    participants: Participant[]
  ): ParticipantResult {
    const failure = this.validateParticipant(participant);
    if (failure) {
      return left(failure);
    }
    return right(this.withParticipants(participants));
  }

  private validateParticipant(
    participant: Participant
  ): Failure<ParticipantValidationError> | null {
    if (!participant.name) {
      return participantNameEmptyFailure();
    }
    if (this.hasParticipantNamed(participant.name, participant.id)) {
      return participantNameTakenFailure();
    }
    const invalidExclusion = participant.exclusions.find(
      (excludedId) =>
        excludedId === participant.id || !this.findParticipant(excludedId)
    );
    if (invalidExclusion !== undefined) {
      return invalidExclusionFailure(invalidExclusion);
    }
    return null;
  }

  private hasParticipantNamed(name: string, ignoreParticipantId: string) {
    const normalized = name.toLowerCase();
    return this.participants.some(
      (participant) =>
        participant.id !== ignoreParticipantId &&
        participant.name.trim().toLowerCase() === normalized
    );
  }

  private withParticipants(participants: Participant[]): GiftExchangeGroup {
    return new GiftExchangeGroup({
      id: this.id,
      name: this.name,
      participants,
    });
  }
}

const unique = (ids: string[]): string[] => [...new Set(ids)];
