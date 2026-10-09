import Gifter from '#src/domain/gifter';
import { Either, left, right } from '#src/application/either';
import { Failure } from '#src/application/failure';
import GifterRepository from '#src/application/ports/gifter-repository';

export enum GetGifterError {
  GifterNotFound = 'GIFTER_NOT_FOUND',
}

type GetGifterResult = Either<Failure<GetGifterError.GifterNotFound>, Gifter>;

type GetGifterDeps = {
  gifterRepository: GifterRepository;
};

const getGifter = ({ gifterRepository }: GetGifterDeps) => {
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

export type GetGifterUseCase = ReturnType<typeof getGifter>;

export default getGifter;

const gifterNotFoundFailure = (): Failure<GetGifterError.GifterNotFound> => ({
  type: GetGifterError.GifterNotFound,
  reason: 'Gifter with that name was not found',
});
