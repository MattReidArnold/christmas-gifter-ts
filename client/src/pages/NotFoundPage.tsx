import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router'

import { paths } from '#src/paths.ts'

export function NotFoundPage({ title = 'Page not found' }: { title?: string }) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      <Typography color="text.secondary">
        It may have been deleted, or the link may be wrong.
      </Typography>
      <Button component={RouterLink} to={paths.groups()} variant="contained">
        Back to groups
      </Button>
    </Stack>
  )
}
