import { queryOptions } from '@tanstack/react-query'

import { authClient } from '#src/api/auth-client.ts'

export interface SessionUser {
  id: string
  email: string
  name: string
}

export const sessionQuery = () =>
  queryOptions({
    queryKey: ['session'] as const,
    queryFn: async (): Promise<SessionUser | null> => {
      const { data } = await authClient.getSession()
      if (!data?.user) {
        return null
      }
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      }
    },
  })
