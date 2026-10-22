import mongoose from 'mongoose';
import GiftExchangeGroup, {
  GroupMember,
  GroupMemberRole,
} from '#src/domain/gift-exchange-group';
import Participant from '#src/domain/participant';

interface ParticipantAttrs {
  id: string;
  name: string;
  exclusions: string[];
}

interface MemberAttrs {
  userId: string;
  role: GroupMemberRole;
}

interface GiftExchangeGroupDocument extends mongoose.Document {
  name: string;
  participants: ParticipantAttrs[];
  members: MemberAttrs[];
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

const MemberSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: ['owner', 'member'], required: true },
  },
  { _id: false }
);

const GiftExchangeGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: { type: [ParticipantSchema], default: [] },
  members: { type: [MemberSchema], required: true },
});

GiftExchangeGroupSchema.index({ 'members.userId': 1 });

const toMember = ({ userId, role }: MemberAttrs): GroupMember => ({
  userId,
  role,
});

GiftExchangeGroupSchema.methods.toEntity = function (): GiftExchangeGroup {
  const { _id, name, participants, members } = this as GiftExchangeGroupDocument;
  return new GiftExchangeGroup({
    id: String(_id),
    name,
    participants: participants.map(
      ({ id, name, exclusions }) =>
        new Participant({ id, name, exclusions: [...exclusions] })
    ),
    members: (members ?? []).map(toMember),
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

export const toMemberAttrs = ({ userId, role }: GroupMember): MemberAttrs => ({
  userId,
  role,
});

export default Model;
