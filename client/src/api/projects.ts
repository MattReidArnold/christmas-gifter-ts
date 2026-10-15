import { queryOptions } from '@tanstack/react-query'

import { apiFetch } from '#src/api/http.ts'
import type { Project, ProjectSort, ProjectStatus } from '#src/api/types.ts'
import { PROJECT_STATUSES } from '#src/api/types.ts'

export type ProjectListParams = {
  statuses?: ProjectStatus[]
  advisorId?: string
  sort?: ProjectSort
}

export const projectKeys = {
  all: ['projects'] as const,
  list: (params: ProjectListParams) => ['projects', params] as const,
}

const buildProjectsPath = ({
  statuses,
  advisorId,
  sort = 'dueDate',
}: ProjectListParams) => {
  const params = new URLSearchParams()
  if (statuses && statuses.length > 0) {
    params.set('status', statuses.join(','))
  }
  if (advisorId) {
    params.set('advisorId', advisorId)
  }
  if (sort !== 'dueDate') {
    params.set('sort', sort)
  }
  const query = params.toString()
  return `/projects${query ? `?${query}` : ''}`
}

export const listProjects = (params: ProjectListParams = {}) =>
  apiFetch<Project[]>(buildProjectsPath(params))

export const projectsQuery = (params: ProjectListParams = {}) =>
  queryOptions({
    queryKey: projectKeys.list(params),
    queryFn: () => listProjects(params),
  })

export const isProjectStatus = (value: string): value is ProjectStatus =>
  PROJECT_STATUSES.includes(value as ProjectStatus)

export const isProjectSort = (value: string): value is ProjectSort =>
  value === 'dueDate' || value === '-dueDate'

export const projectListParamsFromSearch = (
  searchParams: URLSearchParams,
): ProjectListParams => {
  const statusParam = searchParams.get('status')
  const statuses = statusParam
    ? statusParam
        .split(',')
        .map((part) => part.trim())
        .filter(isProjectStatus)
    : undefined
  const advisorId = searchParams.get('advisorId')?.trim() || undefined
  const sortParam = searchParams.get('sort')
  const sort = sortParam && isProjectSort(sortParam) ? sortParam : 'dueDate'
  return {
    statuses: statuses && statuses.length > 0 ? statuses : undefined,
    advisorId,
    sort,
  }
}
