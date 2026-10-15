import { AddParticipantUseCase } from './use-cases/add-participant';
import { CreateGroupUseCase } from './use-cases/create-group';
import { CreateProjectUseCase } from './use-cases/create-project';
import { DeleteGroupUseCase } from './use-cases/delete-group';
import { DeleteProjectUseCase } from './use-cases/delete-project';
import { GetGroupUseCase } from './use-cases/get-group';
import { GetProjectUseCase } from './use-cases/get-project';
import { ListGroupsUseCase } from './use-cases/list-groups';
import { ListProjectsUseCase } from './use-cases/list-projects';
import { RemoveParticipantUseCase } from './use-cases/remove-participant';
import { RenameGroupUseCase } from './use-cases/rename-group';
import { UpdateParticipantUseCase } from './use-cases/update-participant';
import { UpdateProjectUseCase } from './use-cases/update-project';

export default interface UseCases {
  createGroup: CreateGroupUseCase;
  getGroup: GetGroupUseCase;
  listGroups: ListGroupsUseCase;
  renameGroup: RenameGroupUseCase;
  deleteGroup: DeleteGroupUseCase;
  addParticipant: AddParticipantUseCase;
  updateParticipant: UpdateParticipantUseCase;
  removeParticipant: RemoveParticipantUseCase;
  createProject: CreateProjectUseCase;
  getProject: GetProjectUseCase;
  listProjects: ListProjectsUseCase;
  updateProject: UpdateProjectUseCase;
  deleteProject: DeleteProjectUseCase;
}
