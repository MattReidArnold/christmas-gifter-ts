import { vi } from 'vitest'

import type { Group, Participant } from '#src/api/types.ts'

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const failure = (status: number, type: string, reason: string) =>
  json(status, { failure: { type, reason } })

const groupNotFound = () =>
  failure(404, 'GROUP_NOT_FOUND', 'Group with that id was not found')

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

// In-memory stand-in for the server's `/api/groups` endpoints.
export const createFakeApi = (initialGroups: Group[] = []) => {
  let groups: Group[] = structuredClone(initialGroups)
  let nextId = 1
  const newId = (prefix: string) => `${prefix}-${nextId++}`

  const replaceGroup = (group: Group, status = 200) => {
    groups = groups.map((existing) => (existing.id === group.id ? group : existing))
    return json(status, group)
  }

  const handle = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const { pathname } = new URL(String(input), 'http://localhost')
    const method = init.method ?? 'GET'
    const body = init.body ? JSON.parse(String(init.body)) : {}
    const [, , , groupId, , participantId] = pathname.split('/')

    if (!pathname.startsWith('/api/groups')) {
      return json(404)
    }

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
        exclusions: body.exclusions ?? [],
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
      exclusions: body.exclusions ?? existing.exclusions,
    }
    return replaceGroup({
      ...group,
      participants: group.participants.map((participant) =>
        participant.id === existing.id ? updated : participant,
      ),
    })
  }

  return {
    fetch: vi.fn(handle),
    get groups() {
      return groups
    },
  }
}
