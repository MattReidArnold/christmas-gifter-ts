import { Request, Response, NextFunction } from 'express';

import Dependencies from '../application/Dependencies';
import addGifter from '../application/useCases/AddGifter';

export default (dependencies: Dependencies) => {
  const { logger } = dependencies;
  const addGifterCommand = addGifter(dependencies);
  const createGifter = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const name: string = req.body.name ?? '';
    const result = await addGifterCommand.execute(name);
    if (result.isLeft()) {
      const failure = result.value;
      logger.info('failed to add gifter', failure);
      return res.status(422).send(result.value);
    }
    const gifter = result.value;
    logger.info('gifter added', gifter);
    return res.status(201).send(gifter);
  };
  return {
    createGifter,
  };
};
