import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async updateMe(id: string, data: Partial<User>): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec() as any;
  }

  async updatePreferences(
    id: string,
    preferences: { theme?: string; colorMode?: string },
  ): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, { preferences }, { new: true })
      .exec() as any;
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  // Search users by email prefix (for member autocomplete)
  async searchByEmail(email: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ email: { $regex: email, $options: 'i' } })
      .select('_id fullName username email avatar')
      .limit(5)
      .exec();
  }

  // Find user by email, or create a provisional account so they can be invited
  async findOrCreateByEmail(email: string): Promise<UserDocument> {
    const existing = await this.findByEmail(email);
    if (existing) return existing;

    // Create provisional user — they can claim this account by signing in with Google
    const username = email.split('@')[0];
    return this.create({
      fullName: username,
      username,
      email,
      isGuest: false,
    });
  }
}
