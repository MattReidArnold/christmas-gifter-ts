import Logger from './ports/logger.js';
import GiftExchangeGroupRepository from './ports/gift-exchange-group-repository.js';
import IdGenerator from './ports/id-generator.js';

export default interface Dependencies {
  logger: Logger;
  groupRepository: GiftExchangeGroupRepository;
  idGenerator: IdGenerator;
}
