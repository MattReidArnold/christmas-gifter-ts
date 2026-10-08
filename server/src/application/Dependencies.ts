import Logger from './ports/Logger';
import GifterRepository from './ports/GifterRepository';

export default interface Dependencies {
  logger: Logger;
  gifterRepository: GifterRepository;
}
