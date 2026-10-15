import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Toolbar from '@mui/material/Toolbar'
import type { ReactNode } from 'react'
import { Link as RouterLink, Outlet, useNavigation } from 'react-router'

import { paths } from '#src/paths.ts'

export function RootLayout({ children }: { children?: ReactNode }) {
  const navigation = useNavigation()

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
          >
            Christmas Gifter
          </Link>
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
