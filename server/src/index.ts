import app from './infrastructure/web/server';
import dependencies from './main/dependencies';
import { env } from './main/env';
dependencies().then((deps) => {
  app(deps, env.PORT);
});
