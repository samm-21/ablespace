import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>) {}

  async findAll(query: { search?: string; priority?: string; userId?: string } = {}): Promise<ProjectDocument[]> {
    const filter: any = {};
    if (query.userId) {
      filter.$or = [
        { createdBy: new Types.ObjectId(query.userId) },
        { lead: new Types.ObjectId(query.userId) }
      ];
    }
    if (query.priority) filter.priority = query.priority;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    return this.projectModel
      .find(filter)
      .populate('lead', 'fullName username avatar')
      .populate('createdBy', 'fullName username avatar')
      .exec();
  }

  async findById(id: string): Promise<ProjectDocument> {
    const project = await this.projectModel
      .findById(id)
      .populate('lead', 'fullName username avatar')
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(data: any, userId: string): Promise<ProjectDocument> {
    const project = new this.projectModel({ ...data, createdBy: new Types.ObjectId(userId) });
    const saved = await project.save();
    return this.findById(saved._id.toString());
  }

  async update(id: string, data: any): Promise<ProjectDocument> {
    const project = await this.projectModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!project) throw new NotFoundException('Project not found');
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const project = await this.projectModel.findByIdAndDelete(id).exec();
    if (!project) throw new NotFoundException('Project not found');
  }
}
