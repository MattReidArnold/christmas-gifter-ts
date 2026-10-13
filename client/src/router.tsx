import type {
  EnsureQueryDataOptions,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query'
import { data, redirect, type LoaderFunctionArgs, type RouteObject } from 'react-router'

import { groupQuery, groupsQuery } from '#src/api/groups.ts'
import { ApiError } from '#src/api/http.ts'
import { AppLayout } from '#src/layouts/AppLayout.tsx'
import { RootLayout } from '#src/layouts/RootLayout.tsx'
import {
  AddParticipantRoute,
  EditParticipantRoute,
  GroupDetailPage,
  RenameGroupRoute,
} from '#src/pages/GroupDetailPage.tsx'
import { GroupsPage, NewGroupRoute } from '#src/pages/GroupsPage.tsx'
import { NotFoundPage } from '#src/pages/NotFoundPage.tsx'
import { RouteErrorPage } from '#src/pages/RouteErrorPage.tsx'
import { paths } from '#src/paths.ts'

// Serves cached data immediately (refreshing it in the background) unless it
// was invalidated, e.g. by a delete, in which case it waits for the server.
const loadQuery = <TData, TQueryKey extends QueryKey>(
  queryClient: QueryClient,
  options: EnsureQueryDataOptions<TData, Error, TData, TQueryKey>,
): Promise<TData> =>
  queryClient.getQueryState(options.queryKey)?.isInvalidated
    ? queryClient.fetchQuery(options)
    : queryClient.ensureQueryData({ ...options, revalidateIfStale: true })

const loadGroup = async (queryClient: QueryClient, groupId = '') => {
  try {
    return await loadQuery(queryClient, groupQuery(groupId))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw data('Group not found', { status: 404 })
    }
    throw error
  }
}

export const createRoutes = (queryClient: QueryClient): RouteObject[] => [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: (
      <RootLayout>
        <RouteErrorPage />
      </RootLayout>
    ),
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, loader: () => redirect(paths.groups()) },
          {
            path: 'groups',
            loader: async () => {
              await loadQuery(queryClient, groupsQuery())
              return null
            },
            element: <GroupsPage />,
            children: [{ path: 'new', element: <NewGroupRoute /> }],
          },
          {
            path: 'groups/:groupId',
            loader: async ({ params }: LoaderFunctionArgs) => {
              await loadGroup(queryClient, params.groupId)
              return null
            },
            element: <GroupDetailPage />,
            children: [
              { path: 'edit', element: <RenameGroupRoute /> },
              { path: 'participants/new', element: <AddParticipantRoute /> },
              {
                path: 'participants/:participantId/edit',
                loader: async ({ params }: LoaderFunctionArgs) => {
                  const group = await loadGroup(queryClient, params.groupId)
                  if (!group.participants.some(({ id }) => id === params.participantId)) {
                    throw data('Participant not found', { status: 404 })
                  }
                  return null
                },
                element: <EditParticipantRoute />,
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
