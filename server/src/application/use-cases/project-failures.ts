import { Failure } from '#src/domain/shared/failure';

export enum ProjectUseCaseError {
  ProjectNotFound = 'PROJECT_NOT_FOUND',
  ProjectSaveFailed = 'PROJECT_SAVE_FAILED',
}

export const projectNotFoundFailure =
  (): Failure<ProjectUseCaseError.ProjectNotFound> => ({
    type: ProjectUseCaseError.ProjectNotFound,
    reason: 'Project with that id was not found',
  });

export const projectSaveFailedFailure =
  (): Failure<ProjectUseCaseError.ProjectSaveFailed> => ({
    type: ProjectUseCaseError.ProjectSaveFailed,
    reason: 'Project could not be saved at this time',
  });
