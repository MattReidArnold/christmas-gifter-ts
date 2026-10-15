import { randomUUID } from 'node:crypto';

export const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:4000';

export type ParticipantJson = {
  id: string;
  name: string;
  exclusions: string[];
};

export type GroupJson = {
  id: string;
  name: string;
  participants: ParticipantJson[];
};

export type AddressJson = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

export type ProjectJson = {
  id: string;
  name: string;
  status: string;
  dueDate: string;
  address: AddressJson;
  advisorId: string;
};

export type ProjectInput = {
  name?: string;
  status?: string;
  dueDate?: string;
  address?: Partial<AddressJson>;
  advisorId?: string;
};

export type FailureJson = {
  failure: { type: string; reason: string };
};

export type ApiResponse<T> = {
  status: number;
  body: T;
};

const request = async <T>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers:
      body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : undefined };
};

export const failureType = (response: ApiResponse<unknown>): string =>
  (response.body as FailureJson).failure.type;

export const uniqueGroupName = () => `Integration ${randomUUID()}`;

export const uniqueProjectName = () => `Project ${randomUUID()}`;

const defaultAddress: AddressJson = {
  street: '123 Main St',
  city: 'Austin',
  state: 'TX',
  postalCode: '78701',
};

export const createApiClient = () => {
  const createdGroupIds = new Set<string>();
  const createdProjectIds = new Set<string>();

  const createGroup = async (name: string = uniqueGroupName()) => {
    const response = await request<GroupJson>('POST', '/api/groups', { name });
    if (response.status === 201) {
      createdGroupIds.add(response.body.id);
    }
    return response;
  };

  const deleteGroup = async (groupId: string) => {
    const response = await request<undefined>(
      'DELETE',
      `/api/groups/${groupId}`
    );
    createdGroupIds.delete(groupId);
    return response;
  };

  const createProject = async (input: ProjectInput = {}) => {
    const response = await request<ProjectJson>('POST', '/api/projects', {
      name: input.name ?? uniqueProjectName(),
      status: input.status ?? 'lead',
      dueDate: input.dueDate ?? '2026-11-15',
      address: { ...defaultAddress, ...input.address },
      advisorId: input.advisorId ?? 'advisor-1',
    });
    if (response.status === 201) {
      createdProjectIds.add(response.body.id);
    }
    return response;
  };

  const deleteProject = async (projectId: string) => {
    const response = await request<undefined>(
      'DELETE',
      `/api/projects/${projectId}`
    );
    createdProjectIds.delete(projectId);
    return response;
  };

  return {
    health: () => request<unknown>('GET', '/health'),
    createGroup,
    listGroups: () => request<GroupJson[]>('GET', '/api/groups'),
    getGroup: (groupId: string) =>
      request<GroupJson>('GET', `/api/groups/${groupId}`),
    renameGroup: (groupId: string, name: unknown) =>
      request<GroupJson>('PUT', `/api/groups/${groupId}`, { name }),
    deleteGroup,
    addParticipant: (
      groupId: string,
      participant: { name?: string; exclusions?: string[] }
    ) =>
      request<GroupJson>(
        'POST',
        `/api/groups/${groupId}/participants`,
        participant
      ),
    updateParticipant: (
      groupId: string,
      participantId: string,
      changes: { name?: string; exclusions?: string[] }
    ) =>
      request<GroupJson>(
        'PUT',
        `/api/groups/${groupId}/participants/${participantId}`,
        changes
      ),
    removeParticipant: (groupId: string, participantId: string) =>
      request<GroupJson>(
        'DELETE',
        `/api/groups/${groupId}/participants/${participantId}`
      ),
    createProject,
    listProjects: (query: Record<string, string> = {}) => {
      const params = new URLSearchParams(query);
      const suffix = params.toString();
      return request<ProjectJson[]>(
        'GET',
        `/api/projects${suffix ? `?${suffix}` : ''}`
      );
    },
    getProject: (projectId: string) =>
      request<ProjectJson>('GET', `/api/projects/${projectId}`),
    updateProject: (projectId: string, changes: ProjectInput) =>
      request<ProjectJson>('PUT', `/api/projects/${projectId}`, changes),
    deleteProject,
    cleanup: async () => {
      await Promise.all([
        ...[...createdGroupIds].map(deleteGroup),
        ...[...createdProjectIds].map(deleteProject),
      ]);
    },
  };
};
