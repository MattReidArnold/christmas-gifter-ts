import Logger from './Logger';
import GifterRepository from './repositories/GifterRepository';

export default interface Dependencies {
  logger: Logger;
  gifterRepository: GifterRepository;
}
