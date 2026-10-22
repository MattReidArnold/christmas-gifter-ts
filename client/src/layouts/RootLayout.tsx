import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Toolbar from '@mui/material/Toolbar'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link as RouterLink, Outlet, useNavigate, useNavigation } from 'react-router'

import { authClient } from '#src/api/auth-client.ts'
import { sessionQuery } from '#src/api/session.ts'
import { paths } from '#src/paths.ts'

export function RootLayout({ children }: { children?: ReactNode }) {
  const navigation = useNavigation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = sessionQuery()
  const { data: user } = useQuery(session)

  const signOut = async () => {
    await authClient.signOut()
    queryClient.setQueryData(session.queryKey, null)
    await navigate(paths.login())
  }

  return (
    <Box>
      <AppBar position="static" component="header">
        <Toolbar>
          <Link
            component={RouterLink}
            to={paths.groups()}
            color="inherit"
            underline="none"
            variant="h6"
            sx={{ flexGrow: 1 }}
          >
            Christmas Gifter
          </Link>
          {user ? (
            <Button color="inherit" onClick={() => void signOut()}>
              Sign out
            </Button>
          ) : null}
        </Toolbar>
        {navigation.state === 'loading' && (
          <LinearProgress
            aria-label="Loading page"
            color="secondary"
            sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
          />
        )}
      </AppBar>
      <Container component="main" sx={{ py: 4 }}>
        {children ?? <Outlet />}
      </Container>
    </Box>
  )
}
