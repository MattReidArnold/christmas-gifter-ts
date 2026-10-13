import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { isRouteErrorResponse, Link as RouterLink, useRouteError } from 'react-router'

import { ApiError } from '#src/api/http.ts'
import { NotFoundPage } from '#src/pages/NotFoundPage.tsx'
import { paths } from '#src/paths.ts'

const isNotFound = (error: unknown) =>
  (isRouteErrorResponse(error) || error instanceof ApiError) &&
  error.status === 404

const notFoundTitle = (error: unknown) =>
  isRouteErrorResponse(error) && typeof error.data === 'string'
    ? error.data
    : undefined

export function RouteErrorPage() {
  const error = useRouteError()

  if (isNotFound(error)) {
    return <NotFoundPage title={notFoundTitle(error)} />
  }

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1">
        Something went wrong
      </Typography>
      <Alert severity="error">
        {error instanceof Error ? error.message : 'An unexpected error occurred.'}
      </Alert>
      <Button component={RouterLink} to={paths.groups()} variant="contained">
        Back to groups
      </Button>
    </Stack>
  )
}
