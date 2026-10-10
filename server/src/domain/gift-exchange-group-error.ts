import { Failure } from '#src/domain/shared/failure';

export enum GiftExchangeGroupError {
  GroupNameEmpty = 'GROUP_NAME_EMPTY',
  ParticipantNotFound = 'PARTICIPANT_NOT_FOUND',
  ParticipantNameEmpty = 'PARTICIPANT_NAME_EMPTY',
  ParticipantNameTaken = 'PARTICIPANT_NAME_TAKEN',
  InvalidExclusion = 'INVALID_EXCLUSION',
}

export type ParticipantValidationError =
  | GiftExchangeGroupError.ParticipantNameEmpty
  | GiftExchangeGroupError.ParticipantNameTaken
  | GiftExchangeGroupError.InvalidExclusion;

export const groupNameEmptyFailure =
  (): Failure<GiftExchangeGroupError.GroupNameEmpty> => ({
    type: GiftExchangeGroupError.GroupNameEmpty,
    reason: 'Group name cannot be empty',
  });

export const participantNotFoundFailure =
  (): Failure<GiftExchangeGroupError.ParticipantNotFound> => ({
    type: GiftExchangeGroupError.ParticipantNotFound,
    reason: 'Participant with that id was not found in the group',
  });

export const participantNameEmptyFailure =
  (): Failure<GiftExchangeGroupError.ParticipantNameEmpty> => ({
    type: GiftExchangeGroupError.ParticipantNameEmpty,
    reason: 'Participant name cannot be empty',
  });

export const participantNameTakenFailure =
  (): Failure<GiftExchangeGroupError.ParticipantNameTaken> => ({
    type: GiftExchangeGroupError.ParticipantNameTaken,
    reason: 'A participant with this name already exists in the group',
  });

export const invalidExclusionFailure = (
  participantId: string
): Failure<GiftExchangeGroupError.InvalidExclusion> => ({
  type: GiftExchangeGroupError.InvalidExclusion,
  reason: `Exclusion '${participantId}' must be another participant in the group`,
});
