import { Failure } from '#src/domain/shared/failure';
import { Result, err, ok } from '#src/domain/shared/result';
import ProjectRepository from '#src/application/ports/project-repository';
import {
  ProjectUseCaseError,
  projectNotFoundFailure,
} from '#src/application/use-cases/project-failures';

type DeleteProjectResult = Result<
  void,
  Failure<ProjectUseCaseError.ProjectNotFound>
>;

type DeleteProjectDeps = {
  projectRepository: ProjectRepository;
};

const deleteProject = ({ projectRepository }: DeleteProjectDeps) => {
  const execute = async (projectId: string): Promise<DeleteProjectResult> => {
    const deleted = await projectRepository.delete(projectId);
    return deleted ? ok(undefined) : err(projectNotFoundFailure());
  };

  return {
    execute,
  };
};

export type DeleteProjectUseCase = ReturnType<typeof deleteProject>;

export default deleteProject;
