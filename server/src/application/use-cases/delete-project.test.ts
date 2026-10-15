import { beforeEach, describe, expect, it } from 'vitest';

import deleteProject from '#src/application/use-cases/delete-project';
import { ProjectUseCaseError } from '#src/application/use-cases/project-failures';
import { expectErr, expectOk } from '#tests/support/result';
import InMemoryProjectRepository from '#tests/support/in-memory-project-repository';
import { seedProject } from '#tests/support/seed-project';

describe('deleteProject', () => {
  let projectRepository: InMemoryProjectRepository;

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository();
  });

  it('deletes the project', async () => {
    const { id = '' } = await seedProject(projectRepository);

    expectOk(await deleteProject({ projectRepository }).execute(id));

    expect(await projectRepository.getById(id)).toBeNull();
  });

  it('returns not found for an unknown project', async () => {
    const failure = expectErr(
      await deleteProject({ projectRepository }).execute('missing')
    );

    expect(failure.type).toBe(ProjectUseCaseError.ProjectNotFound);
  });
});
