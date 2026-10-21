import CircularProgress from '@mui/material/CircularProgress'
import { Suspense } from 'react'
import { Outlet } from 'react-router'

// Wraps every page that will require a signed-in user. The future login guard
// belongs on this route (as middleware or a loader) so `/login` can stay outside it.
export function AppLayout() {
  return (
    <Suspense fallback={<CircularProgress aria-label="Loading" />}>
      <Outlet />
    </Suspense>
  )
}
