import Logger from '#src/application/ports/logger';
import UseCases from '#src/application/use-cases';

export default interface WebContext {
  logger: Logger;
  useCases: UseCases;
}
