import GifterRepository from '../../../../application/repositories/GifterRepository';
import Gifter from '../../../../entities/Gifter';
import GifterModel from '../models/Gifter';

export default class MongoGifterRepository implements GifterRepository {
  async getByName(name: string): Promise<Gifter | null> {
    const doc = await GifterModel.findOne({ name }).exec();
    if (!doc) {
      return null;
    }
    return doc.toEntity();
  }
  async add(gifter: Gifter): Promise<Gifter> {
    const doc = await GifterModel.create(gifter);
    return doc.toEntity();
  }
  async update(gifter: Gifter): Promise<Gifter | null> {
    const doc = await GifterModel.findOne({ name: gifter.name });
    if (!doc) {
      return null;
    }
    doc.doNotGiftFrom = gifter.doNotGiftFrom;
    doc.giftTo = gifter.giftTo;
    const updatedDoc = await doc.save();
    return updatedDoc.toEntity();
  }
}
