import { Router } from 'express';
import Dependencies from '../../../application/Dependencies';
import health from './healthRouter';
import api from './api';

export default (dependencies: Dependencies) => {
  const routes = Router();

  routes.use('/health', health(dependencies));
  routes.use('/api', api(dependencies));

  return routes;
};
