import app from './frameworks/web/server';
import dependencies from './config/ProjectDependencies';
dependencies().then((deps) => {
  app(deps);
});
