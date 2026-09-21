import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wishlist, WishlistSchema } from './entities/wishlist.entity.js';
import { WishlistController } from './wishlist.controller.js';
import { WishlistService } from './wishlist.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Wishlist.name, schema: WishlistSchema }])],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
