import app from './infrastructure/web/server';
import dependencies from './main/dependencies';
import { env } from './main/env';
import useCases from './main/use-cases';
dependencies().then((deps) => {
  app({ logger: deps.logger, useCases: useCases(deps) }, env.PORT);
});
