import app from './infrastructure/web/server';
import dependencies from './main/dependencies';
dependencies().then((deps) => {
  app(deps);
});
