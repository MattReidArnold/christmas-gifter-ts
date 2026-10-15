import Dependencies from '#src/application/dependencies';
import UseCases from '#src/application/use-cases';
import addParticipant from '#src/application/use-cases/add-participant';
import createGroup from '#src/application/use-cases/create-group';
import createProject from '#src/application/use-cases/create-project';
import deleteGroup from '#src/application/use-cases/delete-group';
import deleteProject from '#src/application/use-cases/delete-project';
import getGroup from '#src/application/use-cases/get-group';
import getProject from '#src/application/use-cases/get-project';
import listGroups from '#src/application/use-cases/list-groups';
import listProjects from '#src/application/use-cases/list-projects';
import removeParticipant from '#src/application/use-cases/remove-participant';
import renameGroup from '#src/application/use-cases/rename-group';
import updateParticipant from '#src/application/use-cases/update-participant';
import updateProject from '#src/application/use-cases/update-project';

export default ({
  groupRepository,
  projectRepository,
  idGenerator,
}: Dependencies): UseCases => ({
  createGroup: createGroup({ groupRepository }),
  getGroup: getGroup({ groupRepository }),
  listGroups: listGroups({ groupRepository }),
  renameGroup: renameGroup({ groupRepository }),
  deleteGroup: deleteGroup({ groupRepository }),
  addParticipant: addParticipant({ groupRepository, idGenerator }),
  updateParticipant: updateParticipant({ groupRepository }),
  removeParticipant: removeParticipant({ groupRepository }),
  createProject: createProject({ projectRepository }),
  getProject: getProject({ projectRepository }),
  listProjects: listProjects({ projectRepository }),
  updateProject: updateProject({ projectRepository }),
  deleteProject: deleteProject({ projectRepository }),
});
