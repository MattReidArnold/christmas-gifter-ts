import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import { GiftExchangeGroupError } from '#src/domain/gift-exchange-group-error';
import { Either, left, right } from '#src/domain/shared/either';
import { Failure } from '#src/domain/shared/failure';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import {
  GroupUseCaseError,
  groupNotFoundFailure,
  groupSaveFailedFailure,
} from '#src/application/use-cases/group-failures';

type RemoveParticipantResult = Either<
  Failure<GroupUseCaseError | GiftExchangeGroupError.ParticipantNotFound>,
  GiftExchangeGroup
>;

type RemoveParticipantDeps = {
  groupRepository: GiftExchangeGroupRepository;
};

const removeParticipant = ({ groupRepository }: RemoveParticipantDeps) => {
  const execute = async (
    groupId: string,
    participantId: string
  ): Promise<RemoveParticipantResult> => {
    const group = await groupRepository.getById(groupId);
    if (!group) {
      return left(groupNotFoundFailure());
    }

    const result = group.removeParticipant(participantId);
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

export type RemoveParticipantUseCase = ReturnType<typeof removeParticipant>;

export default removeParticipant;
