import { Either } from '#src/domain/shared/either';

export const expectRight = <L, A>(result: Either<L, A>): A => {
  if (result.isLeft()) {
    throw new Error(`Expected Right but got Left: ${JSON.stringify(result.value)}`);
  }
  return result.value;
};

export const expectLeft = <L, A>(result: Either<L, A>): L => {
  if (result.isRight()) {
    throw new Error(`Expected Left but got Right: ${JSON.stringify(result.value)}`);
  }
  return result.value;
};
