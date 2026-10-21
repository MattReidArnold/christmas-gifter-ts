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

export interface Failure {
  type: string
  reason: string
}

export interface ParticipantInput {
  name: string
  exclusions: string[]
}
