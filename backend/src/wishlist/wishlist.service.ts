import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wishlist, WishlistDocument } from './entities/wishlist.entity.js';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private readonly wishlistModel: Model<WishlistDocument>,
  ) {}

  async add(userId: string, courseId: string) {
    const existing = await this.wishlistModel.findOne({ userId, courseId });
    if (existing) throw new ConflictException('Course already in wishlist');

    return this.wishlistModel.create({ userId, courseId });
  }

  async remove(userId: string, courseId: string) {
    const item = await this.wishlistModel.findOneAndDelete({ userId, courseId });
    if (!item) throw new NotFoundException('Wishlist item not found');
    return { message: 'Removed from wishlist' };
  }

  async getUserWishlist(userId: string) {
    return this.wishlistModel
      .find({ userId })
      .populate({
        path: 'course',
        populate: [
          { path: 'instructor', populate: { path: 'user' } },
          { path: 'category' },
        ],
      })
      .sort({ addedAt: -1 })
      .exec();
  }

  async isInWishlist(userId: string, courseId: string): Promise<boolean> {
    const item = await this.wishlistModel.findOne({ userId, courseId });
    return !!item;
  }
}
