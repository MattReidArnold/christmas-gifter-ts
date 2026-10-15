import Project from '#src/domain/project';
import ProjectRepository, {
  ProjectListQuery,
} from '#src/application/ports/project-repository';

type ListProjectsDeps = {
  projectRepository: ProjectRepository;
};

const listProjects = ({ projectRepository }: ListProjectsDeps) => {
  const execute = (query: ProjectListQuery): Promise<Project[]> =>
    projectRepository.list(query);

  return {
    execute,
  };
};

export type ListProjectsUseCase = ReturnType<typeof listProjects>;

export default listProjects;
