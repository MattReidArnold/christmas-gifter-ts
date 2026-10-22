import Logger from '#src/application/ports/logger';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import IdGenerator from '#src/application/ports/id-generator';

export default interface Dependencies {
  logger: Logger;
  groupRepository: GiftExchangeGroupRepository;
  idGenerator: IdGenerator;
}
