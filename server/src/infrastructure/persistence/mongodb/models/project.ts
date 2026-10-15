import mongoose from 'mongoose';
import Project, { Address, ProjectStatus } from '#src/domain/project';

interface AddressAttrs {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

interface ProjectDocument extends mongoose.Document {
  name: string;
  status: ProjectStatus;
  dueDate: Date;
  address: AddressAttrs;
  advisorId: string;
  toEntity(): Project;
}

const AddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: Object.values(ProjectStatus),
  },
  dueDate: { type: Date, required: true },
  address: { type: AddressSchema, required: true },
  advisorId: { type: String, required: true },
});

ProjectSchema.index({ advisorId: 1, dueDate: 1 });
ProjectSchema.index({ status: 1, dueDate: 1 });

const toDateOnly = (date: Date): string => date.toISOString().slice(0, 10);

ProjectSchema.methods.toEntity = function (): Project {
  const { _id, name, status, dueDate, address, advisorId } =
    this as ProjectDocument;
  return new Project({
    id: String(_id),
    name,
    status,
    dueDate: toDateOnly(dueDate),
    address: {
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
    },
    advisorId,
  });
};

const Model = mongoose.model<ProjectDocument>('Project', ProjectSchema);

export const toAddressAttrs = ({
  street,
  city,
  state,
  postalCode,
}: Address): AddressAttrs => ({ street, city, state, postalCode });

export const dueDateFromIso = (dueDate: string): Date =>
  new Date(`${dueDate}T00:00:00.000Z`);

export default Model;
