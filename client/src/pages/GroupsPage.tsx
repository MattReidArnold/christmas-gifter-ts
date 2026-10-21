import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router'

import { groupsQuery, useCreateGroup } from '#src/api/groups.ts'
import { GroupFormDialog } from '#src/components/GroupFormDialog.tsx'
import { paths } from '#src/paths.ts'

const participantCount = (count: number) =>
  `${count} ${count === 1 ? 'participant' : 'participants'}`

export function GroupsPage() {
  const { data: groups } = useSuspenseQuery(groupsQuery())

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h4" component="h1">
          Groups
        </Typography>
        <Button
          component={RouterLink}
          to={paths.newGroup()}
          variant="contained"
          startIcon={<AddIcon />}
        >
          New group
        </Button>
      </Stack>

      {groups.length === 0 ? (
        <Typography color="text.secondary">No groups yet</Typography>
      ) : (
        <Paper variant="outlined">
          <List aria-label="Groups" disablePadding>
            {groups.map((group) => (
              <ListItem key={group.id} disablePadding divider>
                <ListItemButton component={RouterLink} to={paths.group(group.id)}>
                  <ListItemText
                    primary={group.name}
                    secondary={
                      <span data-testid="group-participant-count">
                        {participantCount(group.participants.length)}
                      </span>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Outlet />
    </Stack>
  )
}

export function NewGroupRoute() {
  const navigate = useNavigate()
  const createGroup = useCreateGroup()

  return (
    <GroupFormDialog
      title="New group"
      submitLabel="Create"
      pending={createGroup.isPending}
      error={createGroup.error}
      onSubmit={(name) =>
        createGroup.mutate(name, {
          onSuccess: (group) => navigate(paths.group(group.id), { replace: true }),
        })
      }
      onClose={() => navigate(paths.groups(), { replace: true })}
    />
  )
}
