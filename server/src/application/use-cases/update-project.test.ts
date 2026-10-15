import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectUseCaseError } from '#src/application/use-cases/project-failures';
import updateProject from '#src/application/use-cases/update-project';
import { ProjectStatus } from '#src/domain/project';
import { ProjectError } from '#src/domain/project-error';
import { expectErr, expectOk } from '#tests/support/result';
import InMemoryProjectRepository from '#tests/support/in-memory-project-repository';
import { seedProject } from '#tests/support/seed-project';

describe('updateProject', () => {
  let projectRepository: InMemoryProjectRepository;
  let useCase: ReturnType<typeof updateProject>;
  let projectId: string;

  beforeEach(async () => {
    projectRepository = new InMemoryProjectRepository();
    useCase = updateProject({ projectRepository });
    const project = await seedProject(projectRepository);
    projectId = project.id ?? '';
  });

  it('updates the project and saves it', async () => {
    const project = expectOk(
      await useCase.execute(projectId, {
        status: ProjectStatus.Scheduled,
        dueDate: '2026-12-20',
      })
    );

    expect(project.status).toBe(ProjectStatus.Scheduled);
    expect(project.dueDate).toBe('2026-12-20');
    expect(await projectRepository.getById(projectId)).toEqual(project);
  });

  it('returns not found for an unknown project', async () => {
    const failure = expectErr(
      await useCase.execute('missing', { name: 'Heat pump' })
    );

    expect(failure.type).toBe(ProjectUseCaseError.ProjectNotFound);
  });

  it('returns the domain failure without saving', async () => {
    const update = vi.spyOn(projectRepository, 'update');

    const failure = expectErr(
      await useCase.execute(projectId, { status: 'pending' })
    );

    expect(failure.type).toBe(ProjectError.InvalidProjectStatus);
    expect(update).not.toHaveBeenCalled();
  });

  it('returns save failed when the repository cannot update', async () => {
    vi.spyOn(projectRepository, 'update').mockResolvedValue(null);

    const failure = expectErr(
      await useCase.execute(projectId, { name: 'Heat pump' })
    );

    expect(failure.type).toBe(ProjectUseCaseError.ProjectSaveFailed);
  });
});
