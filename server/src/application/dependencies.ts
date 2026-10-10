import Logger from './ports/logger';
import GiftExchangeGroupRepository from './ports/gift-exchange-group-repository';
import IdGenerator from './ports/id-generator';

export default interface Dependencies {
  logger: Logger;
  groupRepository: GiftExchangeGroupRepository;
  idGenerator: IdGenerator;
}
