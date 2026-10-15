export interface Participant {
  id: string
  name: string
  // Ids of other participants in the same group this participant must not be matched with.
  exclusions: string[]
}

export interface Group {
  id: string
  name: string
  participants: Participant[]
}

export type ProjectStatus =
  | 'lead'
  | 'quoted'
  | 'scheduled'
  | 'installed'
  | 'lost'

export const PROJECT_STATUSES: ProjectStatus[] = [
  'lead',
  'quoted',
  'scheduled',
  'installed',
  'lost',
]

export type ProjectSort = 'dueDate' | '-dueDate'

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
}

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  dueDate: string
  address: Address
  advisorId: string
}

export interface Failure {
  type: string
  reason: string
}

export interface ParticipantInput {
  name: string
  exclusions: string[]
}
