import Gifter from '#src/domain/gifter';
import { Either, left, right } from '#src/application/either';
import { Failure } from '#src/application/failure';
import GifterRepository from '#src/application/ports/gifter-repository';

export enum AddGifterError {
  GifterNameEmpty = 'GIFTER_NAME_EMPTY',
  GifterAlreadyExists = 'GIFTER_ALREADY_EXISTS',
}

type AddGifterResult = Either<
  Failure<AddGifterError.GifterAlreadyExists | AddGifterError.GifterNameEmpty>,
  Gifter
>;

type AddGifterDeps = {
  gifterRepository: GifterRepository;
};

const addGifter = ({ gifterRepository }: AddGifterDeps) => {
  const execute = async (
    name: string,
    doNotGiftFrom: string[]
  ): Promise<AddGifterResult> => {
    //check if user name is valid
    if (!name.trim()) {
      return left(gifterNameEmptyFailure());
    }

    //check if user exists by name
    const existing = await gifterRepository.getByName(name);
    if (existing) {
      return left(gifterAlreadyExistsFailure());
    }

    const gifter = await gifterRepository.add(
      new Gifter({ name, doNotGiftFrom })
    );
    return right(gifter);
  };

  return {
    execute,
  };
};

export type AddGifterUseCase = ReturnType<typeof addGifter>;

export default addGifter;

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
