import { beforeEach, describe, expect, it } from 'vitest';

import getProject from '#src/application/use-cases/get-project';
import { ProjectUseCaseError } from '#src/application/use-cases/project-failures';
import { expectErr, expectOk } from '#tests/support/result';
import InMemoryProjectRepository from '#tests/support/in-memory-project-repository';
import { seedProject } from '#tests/support/seed-project';

describe('getProject', () => {
  let projectRepository: InMemoryProjectRepository;

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository();
  });

  it('returns the project', async () => {
    const seeded = await seedProject(projectRepository);

    const project = expectOk(
      await getProject({ projectRepository }).execute(seeded.id ?? '')
    );

    expect(project).toEqual(seeded);
  });

  it('returns not found for an unknown project', async () => {
    const failure = expectErr(
      await getProject({ projectRepository }).execute('missing')
    );

    expect(failure.type).toBe(ProjectUseCaseError.ProjectNotFound);
  });
});
