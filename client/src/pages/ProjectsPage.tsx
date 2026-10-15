import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router'

import {
  projectListParamsFromSearch,
  projectsQuery,
} from '#src/api/projects.ts'
import type { ProjectSort, ProjectStatus } from '#src/api/types.ts'
import { PROJECT_STATUSES } from '#src/api/types.ts'
import { ProjectCard } from '#src/components/ProjectCard.tsx'

const statusLabel: Record<ProjectStatus, string> = {
  lead: 'Lead',
  quoted: 'Quoted',
  scheduled: 'Scheduled',
  installed: 'Installed',
  lost: 'Lost',
}

const setOrDelete = (
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) => {
  if (value) {
    params.set(key, value)
  } else {
    params.delete(key)
  }
}

function AdvisorIdFilter({
  value,
  onCommit,
}: {
  value: string
  onCommit: (value: string) => void
}) {
  const [input, setInput] = useState(value)

  return (
    <TextField
      label="Advisor ID"
      value={input}
      onChange={(event) => setInput(event.target.value)}
      onBlur={() => onCommit(input)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onCommit(input)
        }
      }}
      sx={{ minWidth: 180 }}
    />
  )
}

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const listParams = projectListParamsFromSearch(searchParams)
  const { data: projects } = useSuspenseQuery(projectsQuery(listParams))

  const selectedStatuses = listParams.statuses ?? []
  const sort = listParams.sort ?? 'dueDate'
  const advisorId = listParams.advisorId ?? ''

  const updateParams = (update: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams)
    update(next)
    setSearchParams(next, { replace: true })
  }

  const handleStatusesChange = (event: SelectChangeEvent<ProjectStatus[]>) => {
    const value = event.target.value
    const statuses = typeof value === 'string' ? value.split(',') : value
    updateParams((params) => {
      setOrDelete(
        params,
        'status',
        statuses.length > 0 ? statuses.join(',') : undefined,
      )
    })
  }

  const commitAdvisorId = (value: string) => {
    const trimmed = value.trim()
    if (trimmed === advisorId) {
      return
    }
    updateParams((params) => {
      setOrDelete(params, 'advisorId', trimmed || undefined)
    })
  }

  const handleSortChange = (event: SelectChangeEvent<ProjectSort>) => {
    updateParams((params) => {
      setOrDelete(
        params,
        'sort',
        event.target.value === 'dueDate' ? undefined : event.target.value,
      )
    })
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Projects
      </Typography>

      <Stack
        component="form"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' } }}
        onSubmit={(event) => event.preventDefault()}
        aria-label="Project filters"
      >
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="project-status-filter-label">Status</InputLabel>
          <Select
            labelId="project-status-filter-label"
            label="Status"
            multiple
            value={selectedStatuses}
            onChange={handleStatusesChange}
            renderValue={(selected) =>
              selected.map((status) => statusLabel[status]).join(', ')
            }
          >
            {PROJECT_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {statusLabel[status]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <AdvisorIdFilter
          key={advisorId}
          value={advisorId}
          onCommit={commitAdvisorId}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="project-sort-filter-label">Sort</InputLabel>
          <Select
            labelId="project-sort-filter-label"
            label="Sort"
            value={sort}
            onChange={handleSortChange}
          >
            <MenuItem value="dueDate">Due date (earliest)</MenuItem>
            <MenuItem value="-dueDate">Due date (latest)</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {projects.length === 0 ? (
        <Typography color="text.secondary">No projects yet</Typography>
      ) : (
        <Grid container spacing={2} aria-label="Projects">
          {projects.map((project) => (
            <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  )
}
