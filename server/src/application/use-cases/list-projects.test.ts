import { beforeEach, describe, expect, it } from 'vitest';

import listProjects from '#src/application/use-cases/list-projects';
import { ProjectStatus } from '#src/domain/project';
import InMemoryProjectRepository from '#tests/support/in-memory-project-repository';
import { seedProject } from '#tests/support/seed-project';

describe('listProjects', () => {
  let projectRepository: InMemoryProjectRepository;

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository();
  });

  it('returns an empty list when there are no projects', async () => {
    expect(
      await listProjects({ projectRepository }).execute({ sort: 'dueDate' })
    ).toEqual([]);
  });

  it('filters by status and advisor and sorts by due date', async () => {
    await seedProject(projectRepository, {
      name: 'Later lead',
      status: ProjectStatus.Lead,
      dueDate: '2026-12-01',
      advisorId: 'advisor-1',
    });
    const earlyQuoted = await seedProject(projectRepository, {
      name: 'Early quoted',
      status: ProjectStatus.Quoted,
      dueDate: '2026-10-01',
      advisorId: 'advisor-1',
    });
    await seedProject(projectRepository, {
      name: 'Other advisor',
      status: ProjectStatus.Quoted,
      dueDate: '2026-09-01',
      advisorId: 'advisor-2',
    });
    const lateQuoted = await seedProject(projectRepository, {
      name: 'Late quoted',
      status: ProjectStatus.Quoted,
      dueDate: '2026-11-01',
      advisorId: 'advisor-1',
    });

    const projects = await listProjects({ projectRepository }).execute({
      statuses: [ProjectStatus.Quoted],
      advisorId: 'advisor-1',
      sort: 'dueDate',
    });

    expect(projects.map(({ id }) => id)).toEqual([
      earlyQuoted.id,
      lateQuoted.id,
    ]);
  });

  it('sorts by due date descending', async () => {
    const early = await seedProject(projectRepository, {
      name: 'Early',
      dueDate: '2026-10-01',
    });
    const late = await seedProject(projectRepository, {
      name: 'Late',
      dueDate: '2026-12-01',
    });

    const projects = await listProjects({ projectRepository }).execute({
      sort: '-dueDate',
    });

    expect(projects.map(({ id }) => id)).toEqual([late.id, early.id]);
  });
});
