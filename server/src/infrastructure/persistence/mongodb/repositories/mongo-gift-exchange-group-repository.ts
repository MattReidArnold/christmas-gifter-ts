import mongoose from 'mongoose';

import GiftExchangeGroupRepository from '#src/application/ports/gift-exchange-group-repository';
import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import GiftExchangeGroupModel, {
  toParticipantAttrs,
} from '#src/infrastructure/persistence/mongodb/models/gift-exchange-group';

export default class MongoGiftExchangeGroupRepository
  implements GiftExchangeGroupRepository
{
  async getById(id: string): Promise<GiftExchangeGroup | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }
    const doc = await GiftExchangeGroupModel.findById(id).exec();
    if (!doc) {
      return null;
    }
    return doc.toEntity();
  }
  async add(group: GiftExchangeGroup): Promise<GiftExchangeGroup> {
    const doc = await GiftExchangeGroupModel.create({
      name: group.name,
      participants: group.participants.map(toParticipantAttrs),
    });
    return doc.toEntity();
  }
  async update(group: GiftExchangeGroup): Promise<GiftExchangeGroup | null> {
    if (!group.id || !mongoose.isValidObjectId(group.id)) {
      return null;
    }
    const doc = await GiftExchangeGroupModel.findById(group.id).exec();
    if (!doc) {
      return null;
    }
    doc.name = group.name;
    doc.participants = group.participants.map(toParticipantAttrs);
    const updatedDoc = await doc.save();
    return updatedDoc.toEntity();
  }
}
