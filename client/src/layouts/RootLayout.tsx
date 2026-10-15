import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import type { ReactNode } from 'react'
import { Link as RouterLink, Outlet, useNavigation } from 'react-router'

import { paths } from '#src/paths.ts'

export function RootLayout({ children }: { children?: ReactNode }) {
  const navigation = useNavigation()

  return (
    <Box>
      <AppBar position="static" component="header">
        <Toolbar sx={{ gap: 3 }}>
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
          <Stack
            component="nav"
            direction="row"
            spacing={2}
            aria-label="Primary"
          >
            <Link
              component={RouterLink}
              to={paths.groups()}
              color="inherit"
              underline="hover"
            >
              Groups
            </Link>
            <Link
              component={RouterLink}
              to={paths.projects()}
              color="inherit"
              underline="hover"
            >
              Projects
            </Link>
          </Stack>
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
