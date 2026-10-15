import ProjectRepository, {
  ProjectListQuery,
} from '#src/application/ports/project-repository';
import Project from '#src/domain/project';

export default class InMemoryProjectRepository implements ProjectRepository {
  private readonly projects = new Map<string, Project>();
  private nextId = 1;

  async list({
    statuses,
    advisorId,
    sort,
  }: ProjectListQuery): Promise<Project[]> {
    let projects = [...this.projects.values()];
    if (statuses && statuses.length > 0) {
      const allowed = new Set(statuses);
      projects = projects.filter((project) => allowed.has(project.status));
    }
    if (advisorId) {
      projects = projects.filter((project) => project.advisorId === advisorId);
    }
    const direction = sort === '-dueDate' ? -1 : 1;
    return projects.sort((a, b) => {
      if (a.dueDate === b.dueDate) {
        return (a.id ?? '').localeCompare(b.id ?? '');
      }
      return a.dueDate < b.dueDate ? -direction : direction;
    });
  }

  async getById(id: string): Promise<Project | null> {
    return this.projects.get(id) ?? null;
  }

  async add(project: Project): Promise<Project> {
    const id = `p${this.nextId++}`;
    const saved = new Project({
      id,
      name: project.name,
      status: project.status,
      dueDate: project.dueDate,
      address: project.address,
      advisorId: project.advisorId,
    });
    this.projects.set(id, saved);
    return saved;
  }

  async update(project: Project): Promise<Project | null> {
    if (!project.id || !this.projects.has(project.id)) {
      return null;
    }
    this.projects.set(project.id, project);
    return project;
  }

  async delete(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }
}
