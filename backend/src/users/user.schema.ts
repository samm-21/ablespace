import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false, default: '' })
  email: string;

  @Prop({ default: '' })
  fullName: string;

  @Prop({ default: '' })
  username: string;

  @Prop({ default: '' })
  title: string;

  @Prop({ default: null })
  avatar: string;

  @Prop({ default: false })
  isGuest: boolean;

  @Prop({ default: null })
  googleId: string;

  @Prop({
    type: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      colorMode: {
        type: String,
        enum: ['amber', 'blue', 'pink', 'rose', 'emerald', 'black'],
        default: 'blue',
      },
    },
    default: { theme: 'light', colorMode: 'blue' },
  })
  preferences: {
    theme: 'light' | 'dark';
    colorMode: 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black';
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
