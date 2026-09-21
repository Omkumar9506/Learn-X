import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).populate('instructor');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(userId, { $set: data }, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { avatar: avatarUrl } },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId).select('+password');

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new NotFoundException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.userModel.findByIdAndUpdate(userId, { $set: { password: hashedPassword } });

    return { message: 'Password updated successfully' };
  }

  async findAll(page = 1, limit = 10) {
    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
