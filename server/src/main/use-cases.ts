import Dependencies from '#src/application/dependencies';
import UseCases from '#src/application/use-cases';
import addGifter from '#src/application/use-cases/add-gifter';
import getGifter from '#src/application/use-cases/get-gifter';
import updateGifter from '#src/application/use-cases/update-gifter';

export default ({ gifterRepository }: Dependencies): UseCases => ({
  addGifter: addGifter({ gifterRepository }),
  getGifter: getGifter({ gifterRepository }),
  updateGifter: updateGifter({ gifterRepository }),
});
