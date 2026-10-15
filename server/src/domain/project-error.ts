import { Failure } from '#src/domain/shared/failure';

export enum ProjectError {
  ProjectNameEmpty = 'PROJECT_NAME_EMPTY',
  InvalidProjectStatus = 'INVALID_PROJECT_STATUS',
  InvalidDueDate = 'INVALID_DUE_DATE',
  AddressIncomplete = 'ADDRESS_INCOMPLETE',
  AdvisorIdEmpty = 'ADVISOR_ID_EMPTY',
  InvalidSort = 'INVALID_SORT',
}

export type ProjectValidationError =
  | ProjectError.ProjectNameEmpty
  | ProjectError.InvalidProjectStatus
  | ProjectError.InvalidDueDate
  | ProjectError.AddressIncomplete
  | ProjectError.AdvisorIdEmpty;

export const projectNameEmptyFailure =
  (): Failure<ProjectError.ProjectNameEmpty> => ({
    type: ProjectError.ProjectNameEmpty,
    reason: 'Project name cannot be empty',
  });

export const invalidProjectStatusFailure = (
  status: string
): Failure<ProjectError.InvalidProjectStatus> => ({
  type: ProjectError.InvalidProjectStatus,
  reason: `Project status '${status}' is not valid`,
});

export const invalidDueDateFailure =
  (): Failure<ProjectError.InvalidDueDate> => ({
    type: ProjectError.InvalidDueDate,
    reason: 'Due date must be a valid calendar date in YYYY-MM-DD format',
  });

export const addressIncompleteFailure =
  (): Failure<ProjectError.AddressIncomplete> => ({
    type: ProjectError.AddressIncomplete,
    reason: 'Address street, city, state, and postal code are all required',
  });

export const advisorIdEmptyFailure =
  (): Failure<ProjectError.AdvisorIdEmpty> => ({
    type: ProjectError.AdvisorIdEmpty,
    reason: 'Advisor id cannot be empty',
  });

export const invalidSortFailure = (
  sort: string
): Failure<ProjectError.InvalidSort> => ({
  type: ProjectError.InvalidSort,
  reason: `Sort '${sort}' is not valid; use dueDate or -dueDate`,
});
