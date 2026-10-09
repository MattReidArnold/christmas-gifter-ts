import { Router } from 'express';
import WebContext from '#src/infrastructure/web/web-context';
import health from './health-router';
import api from './api';

const router = (context: WebContext) => {
  const routes = Router();

  routes.use('/health', health(context));
  routes.use('/api', api(context));

  return routes;
};

export default router;
