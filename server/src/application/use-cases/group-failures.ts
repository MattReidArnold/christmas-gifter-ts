import { Failure } from '#src/domain/shared/failure';

export enum GroupUseCaseError {
  GroupNotFound = 'GROUP_NOT_FOUND',
  GroupSaveFailed = 'GROUP_SAVE_FAILED',
}

export const groupNotFoundFailure =
  (): Failure<GroupUseCaseError.GroupNotFound> => ({
    type: GroupUseCaseError.GroupNotFound,
    reason: 'Group with that id was not found',
  });

export const groupSaveFailedFailure =
  (): Failure<GroupUseCaseError.GroupSaveFailed> => ({
    type: GroupUseCaseError.GroupSaveFailed,
    reason: 'Group could not be saved at this time',
  });
