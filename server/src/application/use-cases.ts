import { AddGifterUseCase } from './use-cases/add-gifter';
import { GetGifterUseCase } from './use-cases/get-gifter';
import { UpdateGifterUseCase } from './use-cases/update-gifter';

export default interface UseCases {
  addGifter: AddGifterUseCase;
  getGifter: GetGifterUseCase;
  updateGifter: UpdateGifterUseCase;
}
