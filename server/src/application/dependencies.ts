import Logger from './ports/logger';
import GifterRepository from './ports/gifter-repository';

export default interface Dependencies {
  logger: Logger;
  gifterRepository: GifterRepository;
}
