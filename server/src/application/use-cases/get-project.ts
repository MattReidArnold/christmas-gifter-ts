import Project from '#src/domain/project';
import { Failure } from '#src/domain/shared/failure';
import { Result, err, ok } from '#src/domain/shared/result';
import ProjectRepository from '#src/application/ports/project-repository';
import {
  ProjectUseCaseError,
  projectNotFoundFailure,
} from '#src/application/use-cases/project-failures';

type GetProjectResult = Result<
  Project,
  Failure<ProjectUseCaseError.ProjectNotFound>
>;

type GetProjectDeps = {
  projectRepository: ProjectRepository;
};

const getProject = ({ projectRepository }: GetProjectDeps) => {
  const execute = async (projectId: string): Promise<GetProjectResult> => {
    const project = await projectRepository.getById(projectId);
    return project ? ok(project) : err(projectNotFoundFailure());
  };

  return {
    execute,
  };
};

export type GetProjectUseCase = ReturnType<typeof getProject>;

export default getProject;
