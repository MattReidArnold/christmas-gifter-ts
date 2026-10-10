import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import { ParticipantValidationError } from '#src/domain/gift-exchange-group-error';
import { Either, left, right } from '#src/domain/shared/either';
import { Failure } from '#src/domain/shared/failure';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import IdGenerator from '#src/application/ports/id-generator';
import {
  GroupUseCaseError,
  groupNotFoundFailure,
  groupSaveFailedFailure,
} from '#src/application/use-cases/group-failures';

type AddParticipantResult = Either<
  Failure<GroupUseCaseError | ParticipantValidationError>,
  GiftExchangeGroup
>;

type AddParticipantParams = {
  name: string;
  exclusions: string[];
};

type AddParticipantDeps = {
  groupRepository: GiftExchangeGroupRepository;
  idGenerator: IdGenerator;
};

const addParticipant = ({ groupRepository, idGenerator }: AddParticipantDeps) => {
  const execute = async (
    groupId: string,
    { name, exclusions }: AddParticipantParams
  ): Promise<AddParticipantResult> => {
    const group = await groupRepository.getById(groupId);
    if (!group) {
      return left(groupNotFoundFailure());
    }

    const result = group.addParticipant({
      id: idGenerator.generate(),
      name,
      exclusions,
    });
    if (result.isLeft()) {
      return left(result.value);
    }

    const savedGroup = await groupRepository.update(result.value);
    if (!savedGroup) {
      return left(groupSaveFailedFailure());
    }
    return right(savedGroup);
  };

  return {
    execute,
  };
};

export type AddParticipantUseCase = ReturnType<typeof addParticipant>;

export default addParticipant;
