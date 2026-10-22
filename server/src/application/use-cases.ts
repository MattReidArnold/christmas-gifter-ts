import { AddParticipantUseCase } from './use-cases/add-participant.js';
import { CreateGroupUseCase } from './use-cases/create-group.js';
import { DeleteGroupUseCase } from './use-cases/delete-group.js';
import { GetGroupUseCase } from './use-cases/get-group.js';
import { ListGroupsUseCase } from './use-cases/list-groups.js';
import { RemoveParticipantUseCase } from './use-cases/remove-participant.js';
import { RenameGroupUseCase } from './use-cases/rename-group.js';
import { UpdateParticipantUseCase } from './use-cases/update-participant.js';

export default interface UseCases {
  createGroup: CreateGroupUseCase;
  getGroup: GetGroupUseCase;
  listGroups: ListGroupsUseCase;
  renameGroup: RenameGroupUseCase;
  deleteGroup: DeleteGroupUseCase;
  addParticipant: AddParticipantUseCase;
  updateParticipant: UpdateParticipantUseCase;
  removeParticipant: RemoveParticipantUseCase;
}
