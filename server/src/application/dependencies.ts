import Logger from './ports/logger';
import GiftExchangeGroupRepository from './ports/gift-exchange-group-repository';
import IdGenerator from './ports/id-generator';
import ProjectRepository from './ports/project-repository';

export default interface Dependencies {
  logger: Logger;
  groupRepository: GiftExchangeGroupRepository;
  projectRepository: ProjectRepository;
  idGenerator: IdGenerator;
}
