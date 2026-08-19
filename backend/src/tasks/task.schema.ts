import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    type: String,
    enum: ['todo', 'doing', 'completed', 'on-hold', 'backlog'],
    default: 'todo',
  })
  status: string;

  @Prop({
    type: String,
    enum: ['no-priority', 'urgent', 'high', 'medium', 'low'],
    default: 'no-priority',
  })
  priority: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  @Prop({ default: null })
  dueDate: Date;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  reporter: Types.ObjectId;

  @Prop({ default: '' })
  team: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', default: null })
  project: Types.ObjectId;

  @Prop({
    type: [{ name: String, url: String }],
    default: [],
  })
  resources: { name: string; url: string }[];

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
        title: String,
        priority: { type: String, default: 'no-priority' },
        members: [{ type: Types.ObjectId, ref: 'User' }],
        dueDate: { type: Date, default: null },
        completed: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  subtasks: {
    _id: Types.ObjectId;
    title: string;
    priority: string;
    members: Types.ObjectId[];
    dueDate: Date;
    completed: boolean;
  }[];

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({
    type: [{ message: String, time: { type: Date, default: Date.now } }],
    default: [],
  })
  updates: { message: string; time: Date }[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
