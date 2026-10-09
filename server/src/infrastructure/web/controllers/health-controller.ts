import { Request, Response, NextFunction } from 'express';
import Logger from '#src/application/ports/logger';

type HealthControllerDeps = {
  logger: Logger;
};

const healthController = ({ logger }: HealthControllerDeps) => {
  const getHealth = (_req: Request, res: Response, _next: NextFunction) => {
    logger.info('getting health');
    res.json({ uptime: process.uptime() });
  };
  return {
    getHealth,
  };
};

export default healthController;
