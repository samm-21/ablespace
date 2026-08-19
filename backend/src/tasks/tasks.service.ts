import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './task.schema';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async findAll(query: {
    status?: string;
    priority?: string;
    search?: string;
    projectId?: string;
    userId?: string;
  }): Promise<TaskDocument[]> {
    const filter: any = {};

    // Core isolation: only tasks created by user OR tasks where user is a member
    if (query.userId) {
      const uid = new Types.ObjectId(query.userId);
      filter.$or = [
        { createdBy: uid },
        { members: uid },
      ];
    }

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.projectId) filter.project = new Types.ObjectId(query.projectId);
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };

    return this.taskModel
      .find(filter)
      .populate('members', 'fullName username avatar email')
      .populate('reporter', 'fullName username avatar')
      .populate('createdBy', 'fullName username avatar')
      .sort({ status: 1, order: 1 })
      .exec();
  }

  async findById(id: string): Promise<TaskDocument> {
    const task = await this.taskModel
      .findById(id)
      .populate('members', 'fullName username avatar email')
      .populate('reporter', 'fullName username avatar')
      .populate('createdBy', 'fullName username avatar')
      .populate('project', 'name')
      .exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(dto: CreateTaskDto, userId: string): Promise<TaskDocument> {
    const maxOrderTask = await this.taskModel
      .findOne({ status: dto.status || 'todo' })
      .sort({ order: -1 })
      .exec();
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const taskData: any = {
      ...dto,
      createdBy: new Types.ObjectId(userId),
      order,
    };
    // Cast project string to ObjectId so filtering works correctly
    if (dto.project) taskData.project = new Types.ObjectId(dto.project);
    // Cast member IDs to ObjectIds
    if (dto.members && dto.members.length > 0) {
      taskData.members = dto.members.map(id => new Types.ObjectId(id));
    }

    const task = new this.taskModel(taskData);
    const saved = await task.save();
    return this.findById(saved._id.toString());
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskDocument> {
    const updateData: any = { ...dto };
    // Cast members to ObjectIds if provided
    if (dto.members && dto.members.length > 0) {
      updateData.members = dto.members.map(mid => new Types.ObjectId(mid));
    }
    const task = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!task) throw new NotFoundException('Task not found');
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const task = await this.taskModel.findByIdAndDelete(id).exec();
    if (!task) throw new NotFoundException('Task not found');
  }

  async reorder(id: string, newStatus: string, newOrder: number): Promise<TaskDocument> {
    // Shift other tasks in the column
    await this.taskModel.updateMany(
      { status: newStatus, order: { $gte: newOrder }, _id: { $ne: id } },
      { $inc: { order: 1 } },
    );
    return this.update(id, { status: newStatus, order: newOrder });
  }

  // Subtasks
  async addSubtask(taskId: string, subtask: { title: string; priority?: string; dueDate?: string }): Promise<TaskDocument> {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    task.subtasks.push({
      _id: new Types.ObjectId(),
      title: subtask.title,
      priority: subtask.priority || 'no-priority',
      members: [],
      dueDate: subtask.dueDate ? new Date(subtask.dueDate) : (null as any),
      completed: false,
    });
    await task.save();
    return this.findById(taskId);
  }

  async updateSubtask(taskId: string, subtaskId: string, data: any): Promise<TaskDocument> {
    await this.taskModel.updateOne(
      { _id: taskId, 'subtasks._id': subtaskId },
      { $set: { 'subtasks.$': { ...data, _id: subtaskId } } },
    );
    return this.findById(taskId);
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<TaskDocument> {
    await this.taskModel.updateOne(
      { _id: taskId },
      { $pull: { subtasks: { _id: new Types.ObjectId(subtaskId) } } },
    );
    return this.findById(taskId);
  }
}
