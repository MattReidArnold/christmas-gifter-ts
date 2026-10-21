const segment = (value: string) => encodeURIComponent(value)

export const paths = {
  groups: () => '/groups',
  newGroup: () => '/groups/new',
  group: (groupId: string) => `/groups/${segment(groupId)}`,
  renameGroup: (groupId: string) => `${paths.group(groupId)}/edit`,
  newParticipant: (groupId: string) =>
    `${paths.group(groupId)}/participants/new`,
  editParticipant: (groupId: string, participantId: string) =>
    `${paths.group(groupId)}/participants/${segment(participantId)}/edit`,
}
