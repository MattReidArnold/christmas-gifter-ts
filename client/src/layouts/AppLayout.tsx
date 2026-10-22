import CircularProgress from '@mui/material/CircularProgress'
import { Suspense } from 'react'
import { Outlet } from 'react-router'

// Wraps every page that requires a signed-in user. The login guard is the
// loader on this route, so `/login` can stay outside it.
export function AppLayout() {
  return (
    <Suspense fallback={<CircularProgress aria-label="Loading" />}>
      <Outlet />
    </Suspense>
  )
}
