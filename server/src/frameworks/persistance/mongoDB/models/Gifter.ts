import mongoose from 'mongoose';
import Gifter from '../../../../entities/Gifter';

interface GifterAttrs {
  name: string;
  doNotGiftFrom: [String];
  giftTo?: string;
}

interface GifterModel extends mongoose.Model<GifterDocument> {
  build(attrs: GifterAttrs): GifterDocument;
}

interface GifterDocument extends mongoose.Document {
  name: string;
  doNotGiftFrom: string[];
  giftTo?: string;
  toEntity(): Gifter;
}

const GifterSchema = new mongoose.Schema({
  name: String,
  doNotGiftFrom: [String],
  giftTo: String,
});

GifterSchema.statics.build = (attrs: GifterAttrs) => new Model(attrs);

GifterSchema.methods.toEntity = function (): Gifter {
  const { name, doNotGiftFrom, giftTo, _id: id } = this;
  return new Gifter({ name, doNotGiftFrom, giftTo, id });
};

const Model = mongoose.model<GifterDocument, GifterModel>(
  'Gifter',
  GifterSchema
);

export default Model;
