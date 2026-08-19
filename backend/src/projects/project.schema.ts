import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: String,
    enum: ['no-priority', 'urgent', 'high', 'medium', 'low'],
    default: 'no-priority',
  })
  priority: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  lead: mongoose.Types.ObjectId;

  @Prop({ default: null })
  dueDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: mongoose.Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
