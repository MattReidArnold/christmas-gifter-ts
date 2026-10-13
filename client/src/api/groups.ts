import {
  queryOptions,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { apiFetch } from '#src/api/http.ts'
import type { Group, ParticipantInput } from '#src/api/types.ts'

export const groupKeys = {
  all: ['groups'] as const,
  detail: (groupId: string) => ['groups', groupId] as const,
}

export const groupsQuery = () =>
  queryOptions({
    queryKey: groupKeys.all,
    queryFn: () => apiFetch<Group[]>('/groups'),
  })

export const groupQuery = (groupId: string) =>
  queryOptions({
    queryKey: groupKeys.detail(groupId),
    queryFn: () => apiFetch<Group>(`/groups/${encodeURIComponent(groupId)}`),
  })

const groupPath = (groupId: string) => `/groups/${encodeURIComponent(groupId)}`

const participantPath = (groupId: string, participantId: string) =>
  `${groupPath(groupId)}/participants/${encodeURIComponent(participantId)}`

const cacheGroup = (queryClient: QueryClient, group: Group) => {
  queryClient.setQueryData(groupKeys.detail(group.id), group)
  queryClient.setQueryData<Group[]>(groupKeys.all, (groups) =>
    groups?.some(({ id }) => id === group.id)
      ? groups.map((existing) => (existing.id === group.id ? group : existing))
      : groups && [...groups, group],
  )
  return queryClient.invalidateQueries({ queryKey: groupKeys.all, exact: true })
}

const useGroupMutation = <TVariables>(
  mutationFn: (variables: TVariables) => Promise<Group>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (group) => cacheGroup(queryClient, group),
  })
}

export const useCreateGroup = () =>
  useGroupMutation((name: string) =>
    apiFetch<Group>('/groups', { method: 'POST', body: { name } }),
  )

export const useRenameGroup = (groupId: string) =>
  useGroupMutation((name: string) =>
    apiFetch<Group>(groupPath(groupId), { method: 'PUT', body: { name } }),
  )

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) =>
      apiFetch<void>(groupPath(groupId), { method: 'DELETE' }),
    onSuccess: (_result, groupId) => {
      queryClient.setQueryData<Group[]>(groupKeys.all, (groups) =>
        groups?.filter(({ id }) => id !== groupId),
      )
      // Removing or refetching the detail would 404 the page that is still
      // mounted; marking it invalid makes the next loader fetch it again instead.
      void queryClient.invalidateQueries({
        queryKey: groupKeys.detail(groupId),
        refetchType: 'none',
      })
      return queryClient.invalidateQueries({
        queryKey: groupKeys.all,
        exact: true,
      })
    },
  })
}

export const useAddParticipant = (groupId: string) =>
  useGroupMutation((participant: ParticipantInput) =>
    apiFetch<Group>(`${groupPath(groupId)}/participants`, {
      method: 'POST',
      body: participant,
    }),
  )

export const useUpdateParticipant = (groupId: string, participantId: string) =>
  useGroupMutation((changes: ParticipantInput) =>
    apiFetch<Group>(participantPath(groupId, participantId), {
      method: 'PUT',
      body: changes,
    }),
  )

export const useRemoveParticipant = (groupId: string) =>
  useGroupMutation((participantId: string) =>
    apiFetch<Group>(participantPath(groupId, participantId), {
      method: 'DELETE',
    }),
  )
