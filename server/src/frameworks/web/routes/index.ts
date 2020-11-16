import { Router } from 'express';
import Dependencies from '../../../application/Dependencies';
import health from './health';

export default (dependencies: Dependencies) => {
  const routes = Router();

  const healthRouter = health(dependencies);
  routes.use('/health', healthRouter);

  return routes;
};
