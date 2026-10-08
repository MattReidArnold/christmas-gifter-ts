import Gifter from '#src/entities/Gifter';
import Dependencies from '#src/application/Dependencies';
import { Either, left, right } from '#src/application/Either';
import { Failure } from '#src/application/Failure';

export enum GetGifter {
  GifterNotFound = 'GIFTER_NOT_FOUND',
}

type GetGifterResult = Either<Failure<GetGifter.GifterNotFound>, Gifter>;

const getGifter = (dependencies: Dependencies) => {
  const { gifterRepository } = dependencies;
  const execute = async (name: string): Promise<GetGifterResult> => {
    //check if user exists by name
    const gifter = await gifterRepository.getByName(name);
    if (!gifter) {
      return left(gifterNotFoundFailure());
    }
    return right(gifter);
  };

  return {
    execute,
  };
};

export default getGifter;

const gifterNotFoundFailure = (): Failure<GetGifter.GifterNotFound> => ({
  type: GetGifter.GifterNotFound,
  reason: 'Gifter with that name was not found',
});
