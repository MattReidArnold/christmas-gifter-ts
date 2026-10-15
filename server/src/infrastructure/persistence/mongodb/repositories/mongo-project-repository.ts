import mongoose from 'mongoose';

import ProjectRepository, {
  ProjectListQuery,
} from '#src/application/ports/project-repository';
import Project from '#src/domain/project';
import ProjectModel, {
  dueDateFromIso,
  toAddressAttrs,
} from '#src/infrastructure/persistence/mongodb/models/project';

export default class MongoProjectRepository implements ProjectRepository {
  async list({
    statuses,
    advisorId,
    sort,
  }: ProjectListQuery): Promise<Project[]> {
    const filter: Record<string, unknown> = {};
    if (statuses && statuses.length > 0) {
      filter.status = { $in: statuses };
    }
    if (advisorId) {
      filter.advisorId = advisorId;
    }
    const dueDateDirection = sort === '-dueDate' ? -1 : 1;
    const docs = await ProjectModel.find(filter)
      .sort({ dueDate: dueDateDirection, _id: 1 })
      .exec();
    return docs.map((doc) => doc.toEntity());
  }

  async getById(id: string): Promise<Project | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }
    const doc = await ProjectModel.findById(id).exec();
    if (!doc) {
      return null;
    }
    return doc.toEntity();
  }

  async add(project: Project): Promise<Project> {
    const doc = await ProjectModel.create({
      name: project.name,
      status: project.status,
      dueDate: dueDateFromIso(project.dueDate),
      address: toAddressAttrs(project.address),
      advisorId: project.advisorId,
    });
    return doc.toEntity();
  }

  async update(project: Project): Promise<Project | null> {
    if (!project.id || !mongoose.isValidObjectId(project.id)) {
      return null;
    }
    const doc = await ProjectModel.findById(project.id).exec();
    if (!doc) {
      return null;
    }
    doc.name = project.name;
    doc.status = project.status;
    doc.dueDate = dueDateFromIso(project.dueDate);
    doc.address = toAddressAttrs(project.address);
    doc.advisorId = project.advisorId;
    const updatedDoc = await doc.save();
    return updatedDoc.toEntity();
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(id)) {
      return false;
    }
    const { deletedCount } = await ProjectModel.deleteOne({ _id: id }).exec();
    return deletedCount > 0;
  }
}
