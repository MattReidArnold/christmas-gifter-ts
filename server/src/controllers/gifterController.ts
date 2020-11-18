import { Request, Response, NextFunction } from 'express';

import Dependencies from '../application/Dependencies';
import addGifter from '../application/useCases/AddGifter';
import getGifter from '../application/useCases/GetGifter';
import updateGifterUseCase from '../application/useCases/UpdateGifter';

export default (dependencies: Dependencies) => {
  const { logger } = dependencies;

  const addGifterCommand = addGifter(dependencies);
  const getGifterCommand = getGifter(dependencies);
  const updateGifterCommand = updateGifterUseCase(dependencies);

  const createGifter = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const name: string = req.body.name ?? '';
    const doNotGiftFrom: string[] = req.body.doNotGiftFrom ?? [];
    const result = await addGifterCommand.execute(name, doNotGiftFrom);
    if (result.isLeft()) {
      const failure = result.value;
      logger.info('failed to add gifter', JSON.stringify(failure));
      return res.status(422).send({ failure });
    }
    const gifter = result.value;
    logger.info('gifter added', JSON.stringify(gifter));
    return res.status(201).send(gifter);
  };

  const findGifter = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const name: string = req.params.id ?? '';
    const result = await getGifterCommand.execute(name);
    if (result.isLeft()) {
      const failure = result.value;
      return res.status(404).send({ failure });
    }
    const gifter = result.value;
    return res.send(gifter);
  };

  const updateGifter = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const name: string = req.params.id ?? '';
    const doNotGiftFrom: string[] | undefined = req.body.doNotGiftFrom;
    const giftTo: string | undefined = req.body.giftTo;
    const result = await updateGifterCommand.execute(name, {
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
    createGifter,
    findGifter,
    updateGifter,
  };
};
