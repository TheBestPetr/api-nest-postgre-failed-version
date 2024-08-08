import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLikeEntity,
  PostLikeInfoModelType,
} from '../domain/post.like.entity';
import { LikeStatus } from '../../../base/types/like.statuses';
import { WithId } from 'mongodb';

@Injectable()
export class PostsLikeInfoRepository {
  constructor(
    @InjectModel(PostLikeEntity.name)
    private PostLikeInfoModel: PostLikeInfoModelType,
  ) {}
  async findPostsLikesInfo(
    postId: string,
    userId: string,
  ): Promise<WithId<PostLikeEntity> | null> {
    return this.PostLikeInfoModel.findOne({
      postId: postId,
      userId: userId,
    }).exec();
    // if (result) {
    //   return result;
    // }
    // return null;
  }

  async createNewLikeInfo(postLikeInfo: PostLikeEntity): Promise<boolean> {
    const result = await this.PostLikeInfoModel.create(postLikeInfo);
    return !!result;
  }

  async updatePostLikeInfo(
    postId: string,
    userId: string,
    newStatus: LikeStatus,
  ): Promise<boolean> {
    const result = await this.PostLikeInfoModel.updateOne(
      { postId: postId, userId: userId },
      { $set: { status: newStatus } },
    ).exec();
    return result.matchedCount === 1;
  }

  async findNewestLikes(postId: string): Promise<PostLikeEntity[] | null> {
    const newestLikes = await this.PostLikeInfoModel.find({
      postId: postId,
      status: 'Like',
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();
    return newestLikes.length > 0 ? newestLikes : null;
  }
}
