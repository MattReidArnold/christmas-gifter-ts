import Project, { NewProjectParams } from '#src/domain/project';
import { ProjectValidationError } from '#src/domain/project-error';
import { Failure } from '#src/domain/shared/failure';
import { Result, ok } from '#src/domain/shared/result';
import ProjectRepository from '#src/application/ports/project-repository';

type CreateProjectResult = Result<Project, Failure<ProjectValidationError>>;

type CreateProjectDeps = {
  projectRepository: ProjectRepository;
};

const createProject = ({ projectRepository }: CreateProjectDeps) => {
  const execute = async (
    params: NewProjectParams
  ): Promise<CreateProjectResult> => {
    const result = Project.create(params);
    if (!result.ok) {
      return result;
    }
    return ok(await projectRepository.add(result.value));
  };

  return {
    execute,
  };
};

export type CreateProjectUseCase = ReturnType<typeof createProject>;

export default createProject;
