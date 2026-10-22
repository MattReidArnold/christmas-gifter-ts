import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { vi } from 'vitest'

import type { Group } from '#src/api/types.ts'
import { createQueryClient } from '#src/queryClient.ts'
import { createRoutes } from '#src/router.tsx'
import { createFakeApi } from '#src/test/fakeApi.ts'

// Renders the full route tree at `path`, as if the page had just been loaded or refreshed.
export const renderApp = (
  path: string,
  { groups = [], signedIn = true }: { groups?: Group[]; signedIn?: boolean } = {},
) => {
  const api = createFakeApi(groups, { signedIn })
  vi.stubGlobal('fetch', api.fetch)
  const queryClient = createQueryClient()
  const router = createMemoryRouter(createRoutes(queryClient), {
    initialEntries: [path],
  })
  const user = userEvent.setup()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { api, router, user }
}
