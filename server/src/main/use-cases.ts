import Dependencies from '#src/application/dependencies';
import UseCases from '#src/application/use-cases';
import addParticipant from '#src/application/use-cases/add-participant';
import createGroup from '#src/application/use-cases/create-group';
import getGroup from '#src/application/use-cases/get-group';
import removeParticipant from '#src/application/use-cases/remove-participant';
import updateParticipant from '#src/application/use-cases/update-participant';

export default ({ groupRepository, idGenerator }: Dependencies): UseCases => ({
  createGroup: createGroup({ groupRepository }),
  getGroup: getGroup({ groupRepository }),
  addParticipant: addParticipant({ groupRepository, idGenerator }),
  updateParticipant: updateParticipant({ groupRepository }),
  removeParticipant: removeParticipant({ groupRepository }),
});
