import { AddParticipantUseCase } from './use-cases/add-participant';
import { CreateGroupUseCase } from './use-cases/create-group';
import { GetGroupUseCase } from './use-cases/get-group';
import { RemoveParticipantUseCase } from './use-cases/remove-participant';
import { UpdateParticipantUseCase } from './use-cases/update-participant';

export default interface UseCases {
  createGroup: CreateGroupUseCase;
  getGroup: GetGroupUseCase;
  addParticipant: AddParticipantUseCase;
  updateParticipant: UpdateParticipantUseCase;
  removeParticipant: RemoveParticipantUseCase;
}
