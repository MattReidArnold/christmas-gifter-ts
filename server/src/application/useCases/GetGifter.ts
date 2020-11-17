import Gifter from '../../entities/Gifter';
import Dependencies from '../Dependencies';
import { Either, left, right } from '../Either';
import { Failure } from '../Failure';

export enum GetGifter {
  GifterNotFound = 'GIFTER_NOT_FOUND',
}

type GetGifterResult = Either<Failure<GetGifter.GifterNotFound>, Gifter>;

export default (dependencies: Dependencies) => {
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

const gifterNotFoundFailure = (): Failure<GetGifter.GifterNotFound> => ({
  type: GetGifter.GifterNotFound,
  reason: 'Gifter with that name was not found',
});
