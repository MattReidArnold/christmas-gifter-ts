import Gifter from '#src/domain/gifter';
import { Either, left, right } from '#src/domain/shared/either';
import { Failure } from '#src/domain/shared/failure';
import GifterRepository from '#src/application/ports/gifter-repository';

export enum UpdateGifterError {
  GifterNotFound = 'GIFTER_NOT_FOUND',
  GifterSaveFailed = 'GIFTER_SAVE_FAILED',
}

type UpdateGifterResult = Either<
  Failure<UpdateGifterError.GifterNotFound | UpdateGifterError.GifterSaveFailed>,
  Gifter
>;

type UpdateGifterParams = {
  doNotGiftFrom: string[] | undefined;
  giftTo: string | undefined;
};

type UpdateGifterDeps = {
  gifterRepository: GifterRepository;
};

const updateGifter = ({ gifterRepository }: UpdateGifterDeps) => {
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

export type UpdateGifterUseCase = ReturnType<typeof updateGifter>;

export default updateGifter;

const gifterNotFoundFailure = (): Failure<UpdateGifterError.GifterNotFound> => ({
  type: UpdateGifterError.GifterNotFound,
  reason: 'Gifter with that name was not found',
});
const gifterSaveFailedFailure =
  (): Failure<UpdateGifterError.GifterSaveFailed> => ({
    type: UpdateGifterError.GifterSaveFailed,
    reason: 'Gifter update could not be saved at this time',
  });
