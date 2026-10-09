import { Request, Response, NextFunction } from 'express';

import Logger from '#src/application/ports/logger';
import { AddGifterUseCase } from '#src/application/use-cases/add-gifter';
import { GetGifterUseCase } from '#src/application/use-cases/get-gifter';
import { UpdateGifterUseCase } from '#src/application/use-cases/update-gifter';

type GifterControllerDeps = {
  logger: Logger;
  addGifter: AddGifterUseCase;
  getGifter: GetGifterUseCase;
  updateGifter: UpdateGifterUseCase;
};

const gifterController = ({
  logger,
  addGifter,
  getGifter,
  updateGifter,
}: GifterControllerDeps) => {
  const create = async (req: Request, res: Response, _next: NextFunction) => {
    const name: string = req.body.name ?? '';
    const doNotGiftFrom: string[] = req.body.doNotGiftFrom ?? [];
    const result = await addGifter.execute(name, doNotGiftFrom);
    if (result.isLeft()) {
      const failure = result.value;
      logger.info('failed to add gifter', JSON.stringify(failure));
      return res.status(422).send({ failure });
    }
    const gifter = result.value;
    logger.info('gifter added', JSON.stringify(gifter));
    return res.status(201).send(gifter);
  };

  const find = async (
    req: Request<{ id: string }>,
    res: Response,
    _next: NextFunction
  ) => {
    const name: string = req.params.id ?? '';
    const result = await getGifter.execute(name);
    if (result.isLeft()) {
      const failure = result.value;
      return res.status(404).send({ failure });
    }
    const gifter = result.value;
    return res.send(gifter);
  };

  const update = async (
    req: Request<{ id: string }>,
    res: Response,
    _next: NextFunction
  ) => {
    const name: string = req.params.id ?? '';
    const doNotGiftFrom: string[] | undefined = req.body.doNotGiftFrom;
    const giftTo: string | undefined = req.body.giftTo;
    const result = await updateGifter.execute(name, {
      doNotGiftFrom,
      giftTo,
    });
    if (result.isLeft()) {
      const failure = result.value;
      return res.status(404).send({ failure });
    }
    const gifter = result.value;
    return res.send(gifter);
  };

  return {
    create,
    find,
    update,
  };
};

export default gifterController;
