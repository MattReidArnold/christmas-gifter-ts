import { afterEach, describe, expect, it } from 'vitest';

import {
  createApiClient,
  failureType,
  uniqueGroupName,
} from '#tests/support/api-client';

const api = createApiClient();

afterEach(() => api.cleanup());

describe('POST /api/groups', () => {
  it('creates a group with a trimmed name and no participants', async () => {
    const name = uniqueGroupName();

    const response = await api.createGroup(`  ${name}  `);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      name,
      participants: [],
    });
  });

  it('rejects an empty name', async () => {
    const response = await api.createGroup('   ');

    expect(response.status).toBe(422);
    expect(failureType(response)).toBe('GROUP_NAME_EMPTY');
  });
});

describe('GET /api/groups', () => {
  it('includes the created group', async () => {
    const { body: group } = await api.createGroup();

    const response = await api.listGroups();

    expect(response.status).toBe(200);
    expect(response.body).toContainEqual(group);
  });
});

describe('GET /api/groups/:groupId', () => {
  it('returns the group', async () => {
    const { body: group } = await api.createGroup();

    const response = await api.getGroup(group.id);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(group);
  });

  it.each(['not-an-object-id', '000000000000000000000000'])(
    'returns 404 for the unknown id %s',
    async (groupId) => {
      const response = await api.getGroup(groupId);

      expect(response.status).toBe(404);
      expect(failureType(response)).toBe('GROUP_NOT_FOUND');
    }
  );
});

describe('DELETE /api/groups/:groupId', () => {
  it('deletes the group', async () => {
    const { body: group } = await api.createGroup();

    const response = await api.deleteGroup(group.id);

    expect(response.status).toBe(204);
    expect((await api.getGroup(group.id)).status).toBe(404);
  });

  it('returns 404 when the group does not exist', async () => {
    const response = await api.deleteGroup('000000000000000000000000');

    expect(response.status).toBe(404);
    expect(failureType(response)).toBe('GROUP_NOT_FOUND');
  });
});
