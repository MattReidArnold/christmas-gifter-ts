import { vi } from 'vitest'

import type {
  Group,
  Participant,
  Project,
  ProjectSort,
  ProjectStatus,
} from '#src/api/types.ts'
import { PROJECT_STATUSES } from '#src/api/types.ts'

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const failure = (status: number, type: string, reason: string) =>
  json(status, { failure: { type, reason } })

const groupNotFound = () =>
  failure(404, 'GROUP_NOT_FOUND', 'Group with that id was not found')

const projectNotFound = () =>
  failure(404, 'PROJECT_NOT_FOUND', 'Project with that id was not found')

const participantNotFound = () =>
  failure(404, 'PARTICIPANT_NOT_FOUND', 'Participant with that id was not found in the group')

const participantNameInvalid = (group: Group, name: string, ignoreId?: string) => {
  if (!name) {
    return failure(422, 'PARTICIPANT_NAME_EMPTY', 'Participant name cannot be empty')
  }
  const taken = group.participants.some(
    (participant) =>
      participant.id !== ignoreId &&
      participant.name.toLowerCase() === name.toLowerCase(),
  )
  return taken
    ? failure(422, 'PARTICIPANT_NAME_TAKEN', 'A participant with this name already exists in the group')
    : undefined
}

const isProjectStatus = (value: string): value is ProjectStatus =>
  PROJECT_STATUSES.includes(value as ProjectStatus)

const isProjectSort = (value: string): value is ProjectSort =>
  value === 'dueDate' || value === '-dueDate'

type FakeApiOptions = {
  groups?: Group[]
  projects?: Project[]
}

// In-memory stand-in for the server's `/api/groups` and `/api/projects` endpoints.
export const createFakeApi = ({
  groups: initialGroups = [],
  projects: initialProjects = [],
}: FakeApiOptions = {}) => {
  let groups: Group[] = structuredClone(initialGroups)
  let projects: Project[] = structuredClone(initialProjects)
  let nextId = 1
  const newId = (prefix: string) => `${prefix}-${nextId++}`

  const replaceGroup = (group: Group, status = 200) => {
    groups = groups.map((existing) => (existing.id === group.id ? group : existing))
    return json(status, group)
  }

  const handleGroups = async (
    pathname: string,
    method: string,
    body: Record<string, unknown>,
  ) => {
    const [, , , groupId, , participantId] = pathname.split('/')

    if (!groupId) {
      if (method === 'GET') {
        return json(200, groups)
      }
      const name = String(body.name ?? '').trim()
      if (!name) {
        return failure(422, 'GROUP_NAME_EMPTY', 'Group name cannot be empty')
      }
      const group: Group = { id: newId('group'), name, participants: [] }
      groups = [...groups, group]
      return json(201, group)
    }

    const group = groups.find(({ id }) => id === decodeURIComponent(groupId))
    if (!group) {
      return groupNotFound()
    }

    if (!pathname.includes('/participants')) {
      if (method === 'GET') {
        return json(200, group)
      }
      if (method === 'DELETE') {
        groups = groups.filter(({ id }) => id !== group.id)
        return new Response(null, { status: 204 })
      }
      const name = String(body.name ?? '').trim()
      if (!name) {
        return failure(422, 'GROUP_NAME_EMPTY', 'Group name cannot be empty')
      }
      return replaceGroup({ ...group, name })
    }

    if (!participantId) {
      const name = String(body.name ?? '').trim()
      const invalid = participantNameInvalid(group, name)
      if (invalid) {
        return invalid
      }
      const participant: Participant = {
        id: newId('participant'),
        name,
        exclusions: (body.exclusions as string[] | undefined) ?? [],
      }
      return replaceGroup(
        { ...group, participants: [...group.participants, participant] },
        201,
      )
    }

    const existing = group.participants.find(
      ({ id }) => id === decodeURIComponent(participantId),
    )
    if (!existing) {
      return participantNotFound()
    }

    if (method === 'DELETE') {
      return replaceGroup({
        ...group,
        participants: group.participants
          .filter(({ id }) => id !== existing.id)
          .map((participant) => ({
            ...participant,
            exclusions: participant.exclusions.filter((id) => id !== existing.id),
          })),
      })
    }

    const name = String(body.name ?? existing.name).trim()
    const invalid = participantNameInvalid(group, name, existing.id)
    if (invalid) {
      return invalid
    }
    const updated: Participant = {
      ...existing,
      name,
      exclusions: (body.exclusions as string[] | undefined) ?? existing.exclusions,
    }
    return replaceGroup({
      ...group,
      participants: group.participants.map((participant) =>
        participant.id === existing.id ? updated : participant,
      ),
    })
  }

  const handleProjects = async (
    url: URL,
    method: string,
    body: Record<string, unknown>,
  ) => {
    const [, , , projectId] = url.pathname.split('/')

    if (!projectId) {
      if (method === 'GET') {
        const statusParam = url.searchParams.get('status')
        const advisorId = url.searchParams.get('advisorId') ?? undefined
        const sortParam = url.searchParams.get('sort') ?? 'dueDate'
        if (sortParam && !isProjectSort(sortParam)) {
          return failure(
            422,
            'INVALID_SORT',
            `Sort '${sortParam}' is not valid; use dueDate or -dueDate`,
          )
        }
        let filtered = [...projects]
        if (statusParam) {
          const statuses: ProjectStatus[] = []
          for (const part of statusParam.split(',')) {
            const trimmed = part.trim()
            if (!trimmed) {
              continue
            }
            if (!isProjectStatus(trimmed)) {
              return failure(
                422,
                'INVALID_PROJECT_STATUS',
                `Project status '${trimmed}' is not valid`,
              )
            }
            statuses.push(trimmed)
          }
          if (statuses.length > 0) {
            const allowed = new Set(statuses)
            filtered = filtered.filter((project) => allowed.has(project.status))
          }
        }
        if (advisorId) {
          filtered = filtered.filter((project) => project.advisorId === advisorId)
        }
        const direction = sortParam === '-dueDate' ? -1 : 1
        filtered.sort((a, b) => {
          if (a.dueDate === b.dueDate) {
            return a.id.localeCompare(b.id)
          }
          return a.dueDate < b.dueDate ? -direction : direction
        })
        return json(200, filtered)
      }

      const name = String(body.name ?? '').trim()
      if (!name) {
        return failure(422, 'PROJECT_NAME_EMPTY', 'Project name cannot be empty')
      }
      const status = String(body.status ?? '')
      if (!isProjectStatus(status)) {
        return failure(
          422,
          'INVALID_PROJECT_STATUS',
          `Project status '${status}' is not valid`,
        )
      }
      const project: Project = {
        id: newId('project'),
        name,
        status,
        dueDate: String(body.dueDate ?? ''),
        address: body.address as Project['address'],
        advisorId: String(body.advisorId ?? '').trim(),
      }
      projects = [...projects, project]
      return json(201, project)
    }

    const project = projects.find(({ id }) => id === decodeURIComponent(projectId))
    if (!project) {
      return projectNotFound()
    }

    if (method === 'GET') {
      return json(200, project)
    }
    if (method === 'DELETE') {
      projects = projects.filter(({ id }) => id !== project.id)
      return new Response(null, { status: 204 })
    }

    const updated: Project = {
      ...project,
      name: body.name !== undefined ? String(body.name).trim() : project.name,
      status:
        body.status !== undefined
          ? (String(body.status) as ProjectStatus)
          : project.status,
      dueDate:
        body.dueDate !== undefined ? String(body.dueDate) : project.dueDate,
      address:
        body.address !== undefined
          ? (body.address as Project['address'])
          : project.address,
      advisorId:
        body.advisorId !== undefined
          ? String(body.advisorId).trim()
          : project.advisorId,
    }
    projects = projects.map((existing) =>
      existing.id === project.id ? updated : existing,
    )
    return json(200, updated)
  }

  const handle = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input), 'http://localhost')
    const method = init.method ?? 'GET'
    const body = init.body ? JSON.parse(String(init.body)) : {}

    if (url.pathname.startsWith('/api/groups')) {
      return handleGroups(url.pathname, method, body)
    }
    if (url.pathname.startsWith('/api/projects')) {
      return handleProjects(url, method, body)
    }
    return json(404)
  }

  return {
    fetch: vi.fn(handle),
    get groups() {
      return groups
    },
    get projects() {
      return projects
    },
  }
}
