import { afterEach, describe, expect, it } from 'vitest';

import {
  createApiClient,
  failureType,
  uniqueProjectName,
} from '#tests/support/api-client';

const api = createApiClient();

afterEach(() => api.cleanup());

describe('POST /api/projects', () => {
  it('creates a project with trimmed fields', async () => {
    const name = uniqueProjectName();

    const response = await api.createProject({
      name: `  ${name}  `,
      status: 'quoted',
      dueDate: '2026-11-15',
      address: {
        street: '  456 Oak Ave  ',
        city: '  Dallas  ',
        state: '  TX  ',
        postalCode: '  75201  ',
      },
      advisorId: '  advisor-9  ',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      name,
      status: 'quoted',
      dueDate: '2026-11-15',
      address: {
        street: '456 Oak Ave',
        city: 'Dallas',
        state: 'TX',
        postalCode: '75201',
      },
      advisorId: 'advisor-9',
    });
  });

  it('rejects an empty name', async () => {
    const response = await api.createProject({ name: '   ' });

    expect(response.status).toBe(422);
    expect(failureType(response)).toBe('PROJECT_NAME_EMPTY');
  });

  it('rejects an invalid status', async () => {
    const response = await api.createProject({ status: 'pending' });

    expect(response.status).toBe(422);
    expect(failureType(response)).toBe('INVALID_PROJECT_STATUS');
  });
});

describe('GET /api/projects', () => {
  it('filters by status and advisor and sorts by due date', async () => {
    const { body: early } = await api.createProject({
      status: 'quoted',
      dueDate: '2026-10-01',
      advisorId: 'advisor-1',
    });
    const { body: late } = await api.createProject({
      status: 'quoted',
      dueDate: '2026-12-01',
      advisorId: 'advisor-1',
    });
    await api.createProject({
      status: 'lead',
      dueDate: '2026-09-01',
      advisorId: 'advisor-1',
    });
    await api.createProject({
      status: 'quoted',
      dueDate: '2026-08-01',
      advisorId: 'advisor-2',
    });

    const response = await api.listProjects({
      status: 'quoted,scheduled',
      advisorId: 'advisor-1',
      sort: 'dueDate',
    });

    expect(response.status).toBe(200);
    expect(response.body.map(({ id }) => id)).toEqual([early.id, late.id]);
  });

  it('sorts by due date descending', async () => {
    const { body: early } = await api.createProject({ dueDate: '2026-10-01' });
    const { body: late } = await api.createProject({ dueDate: '2026-12-01' });

    const response = await api.listProjects({ sort: '-dueDate' });

    expect(response.status).toBe(200);
    const ids = response.body.map(({ id }) => id);
    expect(ids.indexOf(late.id)).toBeLessThan(ids.indexOf(early.id));
  });

  it('rejects an unknown status filter', async () => {
    const response = await api.listProjects({ status: 'pending' });

    expect(response.status).toBe(422);
    expect(failureType(response)).toBe('INVALID_PROJECT_STATUS');
  });

  it('rejects an unknown sort', async () => {
    const response = await api.listProjects({ sort: 'name' });

    expect(response.status).toBe(422);
    expect(failureType(response)).toBe('INVALID_SORT');
  });
});

describe('GET /api/projects/:projectId', () => {
  it('returns the project', async () => {
    const { body: project } = await api.createProject();

    const response = await api.getProject(project.id);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(project);
  });

  it.each(['not-an-object-id', '000000000000000000000000'])(
    'returns 404 for the unknown id %s',
    async (projectId) => {
      const response = await api.getProject(projectId);

      expect(response.status).toBe(404);
      expect(failureType(response)).toBe('PROJECT_NOT_FOUND');
    }
  );
});

describe('PUT /api/projects/:projectId', () => {
  it('updates the project', async () => {
    const { body: project } = await api.createProject({ status: 'lead' });

    const response = await api.updateProject(project.id, {
      status: 'scheduled',
      dueDate: '2026-12-20',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: project.id,
      name: project.name,
      status: 'scheduled',
      dueDate: '2026-12-20',
      advisorId: project.advisorId,
    });
  });

  it('returns 404 when the project does not exist', async () => {
    const response = await api.updateProject('000000000000000000000000', {
      name: 'Gone',
    });

    expect(response.status).toBe(404);
    expect(failureType(response)).toBe('PROJECT_NOT_FOUND');
  });
});

describe('DELETE /api/projects/:projectId', () => {
  it('deletes the project', async () => {
    const { body: project } = await api.createProject();

    const response = await api.deleteProject(project.id);

    expect(response.status).toBe(204);
    expect((await api.getProject(project.id)).status).toBe(404);
  });

  it('returns 404 when the project does not exist', async () => {
    const response = await api.deleteProject('000000000000000000000000');

    expect(response.status).toBe(404);
    expect(failureType(response)).toBe('PROJECT_NOT_FOUND');
  });
});
