import { createAuthClient } from 'better-auth/react'

// Resolve fetch at call time so tests can stub global fetch after this module loads.
export const authClient = createAuthClient({
  fetchOptions: {
    customFetchImpl: (input, init) => globalThis.fetch(input, init),
  },
})
