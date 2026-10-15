import Project, { ProjectChanges } from '#src/domain/project';
import { ProjectValidationError } from '#src/domain/project-error';
import { Failure } from '#src/domain/shared/failure';
import { Result, err, ok } from '#src/domain/shared/result';
import ProjectRepository from '#src/application/ports/project-repository';
import {
  ProjectUseCaseError,
  projectNotFoundFailure,
  projectSaveFailedFailure,
} from '#src/application/use-cases/project-failures';

type UpdateProjectResult = Result<
  Project,
  Failure<ProjectUseCaseError | ProjectValidationError>
>;

type UpdateProjectDeps = {
  projectRepository: ProjectRepository;
};

const updateProject = ({ projectRepository }: UpdateProjectDeps) => {
  const execute = async (
    projectId: string,
    changes: ProjectChanges
  ): Promise<UpdateProjectResult> => {
    const project = await projectRepository.getById(projectId);
    if (!project) {
      return err(projectNotFoundFailure());
    }

    const result = project.update(changes);
    if (!result.ok) {
      return result;
    }

    const savedProject = await projectRepository.update(result.value);
    return savedProject ? ok(savedProject) : err(projectSaveFailedFailure());
  };

  return {
    execute,
  };
};

export type UpdateProjectUseCase = ReturnType<typeof updateProject>;

export default updateProject;
