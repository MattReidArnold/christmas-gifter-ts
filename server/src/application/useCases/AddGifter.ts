import Gifter from '../../entities/Gifter';
import Dependencies from '../Dependencies';
import { Either, left, right } from '../Either';
import { Failure } from '../Failure';

export enum AddGifterError {
  GifterNameEmpty = 'GIFTER_NAME_EMPTY',
  GifterAlreadyExists = 'GIFTER_ALREADY_EXISTS',
}

type AddGifterResult = Either<
  Failure<AddGifterError.GifterAlreadyExists | AddGifterError.GifterNameEmpty>,
  Gifter
>;

export default (dependencies: Dependencies) => {
  const { gifterRepository, logger } = dependencies;
  const execute = async (name: string): Promise<AddGifterResult> => {
    //check if user name is valid
    if (!name.trim()) {
      return left(gifterNameEmptyFailure());
    }

    //check if user exists by name
    const existing = await gifterRepository.getByName(name);
    if (existing) {
      return left(gifterAlreadyExistsFailure());
    }

    const gifter = await gifterRepository.add(new Gifter(name));
    return right(gifter);
  };

  return {
    execute,
  };
};

const gifterNameEmptyFailure = (): Failure<AddGifterError.GifterNameEmpty> => ({
  type: AddGifterError.GifterNameEmpty,
  reason: 'Gifter name cannot be empty',
});

const gifterAlreadyExistsFailure = (): Failure<
  AddGifterError.GifterAlreadyExists
> => ({
  type: AddGifterError.GifterAlreadyExists,
  reason: 'Gifter with this name already exists',
});
