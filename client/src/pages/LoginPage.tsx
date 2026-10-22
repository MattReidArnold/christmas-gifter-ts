import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { authClient } from '#src/api/auth-client.ts'
import { paths } from '#src/paths.ts'

export function LoginPage() {
  return (
    <Stack spacing={3} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1">
        Sign in
      </Typography>
      <Button
        variant="contained"
        onClick={() =>
          void authClient.signIn.social({
            provider: 'google',
            callbackURL: paths.groups(),
          })
        }
      >
        Sign in with Google
      </Button>
    </Stack>
  )
}
