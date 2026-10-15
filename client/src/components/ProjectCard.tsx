import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { Project, ProjectStatus } from '#src/api/types.ts'

const statusLabel: Record<ProjectStatus, string> = {
  lead: 'Lead',
  quoted: 'Quoted',
  scheduled: 'Scheduled',
  installed: 'Installed',
  lost: 'Lost',
}

const formatDueDate = (dueDate: string) => {
  const [year, month, day] = dueDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card variant="outlined" component="article" aria-label={project.name}>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6" component="h2">
            {project.name}
          </Typography>
          <Chip
            label={statusLabel[project.status]}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          />
          <Typography color="text.secondary">
            Due {formatDueDate(project.dueDate)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
