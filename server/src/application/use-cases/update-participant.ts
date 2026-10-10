import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import {
  GiftExchangeGroupError,
  ParticipantValidationError,
} from '#src/domain/gift-exchange-group-error';
import { Either, left, right } from '#src/domain/shared/either';
import { Failure } from '#src/domain/shared/failure';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import {
  GroupUseCaseError,
  groupNotFoundFailure,
  groupSaveFailedFailure,
} from '#src/application/use-cases/group-failures';

type UpdateParticipantResult = Either<
  Failure<
    | GroupUseCaseError
    | GiftExchangeGroupError.ParticipantNotFound
    | ParticipantValidationError
  >,
  GiftExchangeGroup
>;

type UpdateParticipantParams = {
  name: string | undefined;
  exclusions: string[] | undefined;
};

type UpdateParticipantDeps = {
  groupRepository: GiftExchangeGroupRepository;
};

const updateParticipant = ({ groupRepository }: UpdateParticipantDeps) => {
  const execute = async (
    groupId: string,
    participantId: string,
    params: UpdateParticipantParams
  ): Promise<UpdateParticipantResult> => {
    const group = await groupRepository.getById(groupId);
    if (!group) {
      return left(groupNotFoundFailure());
    }

    const result = group.updateParticipant(participantId, params);
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

export type UpdateParticipantUseCase = ReturnType<typeof updateParticipant>;

export default updateParticipant;
