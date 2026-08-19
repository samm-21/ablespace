import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async findByTask(taskId: string): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ task: new Types.ObjectId(taskId) })
      .populate('author', 'fullName username avatar')
      .sort({ createdAt: 1 })
      .exec();
  }

  async create(taskId: string, authorId: string, content: string, parentComment?: string): Promise<CommentDocument> {
    const comment = new this.commentModel({
      task: new Types.ObjectId(taskId),
      author: new Types.ObjectId(authorId),
      content,
      parentComment: parentComment ? new Types.ObjectId(parentComment) : null,
    });
    const saved = await comment.save();
    return this.commentModel.findById(saved._id).populate('author', 'fullName username avatar').exec() as any;
  }

  async update(id: string, content: string): Promise<CommentDocument> {
    const comment = await this.commentModel
      .findByIdAndUpdate(id, { content }, { new: true })
      .populate('author', 'fullName username avatar')
      .exec();
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async delete(id: string): Promise<void> {
    await this.commentModel.findByIdAndDelete(id).exec();
    // Also delete replies
    await this.commentModel.deleteMany({ parentComment: new Types.ObjectId(id) }).exec();
  }
}
