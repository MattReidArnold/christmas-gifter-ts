import { AddParticipantUseCase } from '#src/application/use-cases/add-participant';
import { CreateGroupUseCase } from '#src/application/use-cases/create-group';
import { DeleteGroupUseCase } from '#src/application/use-cases/delete-group';
import { GetGroupUseCase } from '#src/application/use-cases/get-group';
import { ListGroupsUseCase } from '#src/application/use-cases/list-groups';
import { RemoveParticipantUseCase } from '#src/application/use-cases/remove-participant';
import { RenameGroupUseCase } from '#src/application/use-cases/rename-group';
import { UpdateParticipantUseCase } from '#src/application/use-cases/update-participant';

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
