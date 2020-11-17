import { model, Schema, Document } from 'mongoose';

import GifterRepository from '../../../../application/repositories/GifterRepository';
import Gifter from '../../../../entities/Gifter';

const GifterSchema = new Schema({
  name: String,
  doNotGiftFrom: [String],
  giftTo: String,
});

interface GifterDocument extends Document {
  name: string;
  doNotGiftFrom: string[];
  giftTo?: string;
}

const GifterModel = model<GifterDocument>('Gifter', GifterSchema);

const mapDocToEntity = (doc: GifterDocument): Gifter => {
  const { name, doNotGiftFrom, giftTo, _id: id } = doc;
  return new Gifter({ name, doNotGiftFrom, giftTo, id });
};

export default class MongoGifterRepository implements GifterRepository {
  async getByName(name: string): Promise<Gifter | null> {
    const doc = await GifterModel.findOne({ name }).exec();
    if (!doc) {
      return null;
    }
    return mapDocToEntity(doc);
  }
  async add(gifter: Gifter): Promise<Gifter> {
    const doc = await GifterModel.create(gifter);
    return mapDocToEntity(doc);
  }
}
