import Logger from '#src/application/ports/logger';
import UseCases from '#src/application/use-cases';
import { Auth } from '#src/infrastructure/auth/better-auth';

export default interface WebContext {
  logger: Logger;
  useCases: UseCases;
  auth: Auth;
}
