import { beforeEach, describe, expect, it, vi } from 'vitest';

import createProject from '#src/application/use-cases/create-project';
import { ProjectStatus } from '#src/domain/project';
import { ProjectError } from '#src/domain/project-error';
import { expectErr, expectOk } from '#tests/support/result';
import InMemoryProjectRepository from '#tests/support/in-memory-project-repository';

const address = {
  street: '123 Main St',
  city: 'Austin',
  state: 'TX',
  postalCode: '78701',
};

describe('createProject', () => {
  let projectRepository: InMemoryProjectRepository;

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository();
  });

  it('saves a new project and returns it with an id', async () => {
    const project = expectOk(
      await createProject({ projectRepository }).execute({
        name: '  Furnace install  ',
        status: ProjectStatus.Lead,
        dueDate: '2026-11-15',
        address,
        advisorId: 'advisor-1',
      })
    );

    expect(project.id).toBeDefined();
    expect(project.name).toBe('Furnace install');
    expect(await projectRepository.getById(project.id ?? '')).toEqual(project);
  });

  it('returns the domain failure without saving', async () => {
    const add = vi.spyOn(projectRepository, 'add');

    const failure = expectErr(
      await createProject({ projectRepository }).execute({
        name: '   ',
        status: ProjectStatus.Lead,
        dueDate: '2026-11-15',
        address,
        advisorId: 'advisor-1',
      })
    );

    expect(failure.type).toBe(ProjectError.ProjectNameEmpty);
    expect(add).not.toHaveBeenCalled();
  });
});
