import mongoose from 'mongoose';
import GiftExchangeGroup from '#src/domain/gift-exchange-group';
import Participant from '#src/domain/participant';

interface ParticipantAttrs {
  id: string;
  name: string;
  exclusions: string[];
}

interface GiftExchangeGroupDocument extends mongoose.Document {
  name: string;
  participants: ParticipantAttrs[];
  toEntity(): GiftExchangeGroup;
}

const ParticipantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    exclusions: { type: [String], default: [] },
  },
  { _id: false }
);

const GiftExchangeGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: { type: [ParticipantSchema], default: [] },
});

GiftExchangeGroupSchema.methods.toEntity = function (): GiftExchangeGroup {
  const { _id, name, participants } = this as GiftExchangeGroupDocument;
  return new GiftExchangeGroup({
    id: String(_id),
    name,
    participants: participants.map(
      ({ id, name, exclusions }) =>
        new Participant({ id, name, exclusions: [...exclusions] })
    ),
  });
};

const Model = mongoose.model<GiftExchangeGroupDocument>(
  'GiftExchangeGroup',
  GiftExchangeGroupSchema
);

export const toParticipantAttrs = ({
  id,
  name,
  exclusions,
}: Participant): ParticipantAttrs => ({ id, name, exclusions });

export default Model;
