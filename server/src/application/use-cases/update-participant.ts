import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import {
  GiftExchangeGroupError,
  ParticipantValidationError,
} from '#src/domain/gift-exchange-group-error';
import { Failure } from '#src/domain/shared/failure';
import { Result, err, ok } from '#src/domain/shared/result';
import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import {
  GroupUseCaseError,
  groupNotFoundFailure,
  groupSaveFailedFailure,
} from '#src/application/use-cases/group-failures';

type UpdateParticipantResult = Result<
  GiftExchangeGroup,
  Failure<
    | GroupUseCaseError
    | GiftExchangeGroupError.ParticipantNotFound
    | ParticipantValidationError
  >
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
      return err(groupNotFoundFailure());
    }

    const result = group.updateParticipant(participantId, params);
    if (!result.ok) {
      return result;
    }

    const savedGroup = await groupRepository.update(result.value);
    return savedGroup ? ok(savedGroup) : err(groupSaveFailedFailure());
  };

  return {
    execute,
  };
};

export type UpdateParticipantUseCase = ReturnType<typeof updateParticipant>;

export default updateParticipant;
