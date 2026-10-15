import ProjectRepository from '#src/application/ports/project-repository';
import Project, {
  AddressInput,
  NewProjectParams,
  ProjectStatus,
} from '#src/domain/project';
import { expectOk } from '#tests/support/result';

type SeedProjectParams = Partial<NewProjectParams> & {
  name?: string;
};

const defaultAddress: AddressInput = {
  street: '123 Main St',
  city: 'Austin',
  state: 'TX',
  postalCode: '78701',
};

export const seedProject = async (
  repository: ProjectRepository,
  {
    name = 'Furnace install',
    status = ProjectStatus.Lead,
    dueDate = '2026-11-15',
    address = defaultAddress,
    advisorId = 'advisor-1',
  }: SeedProjectParams = {}
): Promise<Project> => {
  const project = expectOk(
    Project.create({ name, status, dueDate, address, advisorId })
  );
  return repository.add(project);
};
