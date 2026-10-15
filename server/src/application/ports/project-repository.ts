import Project, { ProjectStatus } from '#src/domain/project';

export type ProjectSort = 'dueDate' | '-dueDate';

export type ProjectListQuery = {
  statuses?: ProjectStatus[];
  advisorId?: string;
  sort: ProjectSort;
};

export default interface ProjectRepository {
  list: (query: ProjectListQuery) => Promise<Project[]>;
  getById: (id: string) => Promise<Project | null>;
  add: (project: Project) => Promise<Project>;
  update: (project: Project) => Promise<Project | null>;
  delete: (id: string) => Promise<boolean>;
}
