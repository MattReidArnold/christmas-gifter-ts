import { Request, Response, NextFunction } from 'express';
import Dependencies from '#src/application/Dependencies';

const healthController = (dependencies: Dependencies) => {
  const { logger } = dependencies;
  const getHealth = (_req: Request, res: Response, _next: NextFunction) => {
    logger.info('getting health');
    res.json({ uptime: process.uptime() });
  };
  return {
    getHealth,
  };
};

export default healthController;
