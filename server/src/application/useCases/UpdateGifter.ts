import Gifter from '../../entities/Gifter';
import Dependencies from '../Dependencies';
import { Either, left, right } from '../Either';
import { Failure } from '../Failure';

export enum UpdateGifter {
  GifterNotFound = 'GIFTER_NOT_FOUND',
  GifterSaveFailed = 'GIFTER_SAVE_FAILED',
}

type UpdateGifterResult = Either<
  Failure<UpdateGifter.GifterNotFound | UpdateGifter.GifterSaveFailed>,
  Gifter
>;

type UpdateGifterParams = {
  doNotGiftFrom: string[] | undefined;
  giftTo: string | undefined;
};

export default (dependencies: Dependencies) => {
  const { gifterRepository } = dependencies;
  const execute = async (
    name: string,
    params: UpdateGifterParams
  ): Promise<UpdateGifterResult> => {
    const gifter = await gifterRepository.getByName(name);
    if (!gifter) {
      return left(gifterNotFoundFailure());
    }
    const updateGifter = new Gifter({
      id: gifter.id,
      name: gifter.name,
      doNotGiftFrom: params.doNotGiftFrom ?? gifter.doNotGiftFrom,
      giftTo: params.giftTo ?? gifter.giftTo,
    });

    const updatedGifter = await gifterRepository.update(updateGifter);
    if (!updatedGifter) {
      return left(gifterSaveFailedFailure());
    }

    return right(updatedGifter);
  };

  return {
    execute,
  };
};

const gifterNotFoundFailure = (): Failure<UpdateGifter.GifterNotFound> => ({
  type: UpdateGifter.GifterNotFound,
  reason: 'Gifter with that name was not found',
});
const gifterSaveFailedFailure = (): Failure<UpdateGifter.GifterSaveFailed> => ({
  type: UpdateGifter.GifterSaveFailed,
  reason: 'Gifter update could not be saved at this time',
});
