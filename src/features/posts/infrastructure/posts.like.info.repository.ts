import { Injectable } from '@nestjs/common';
import { PostLikeEntity } from '../domain/post.like.entity';
import { LikeStatus } from '../../../base/types/like.statuses';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsLikeInfoRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findPostsLikesInfo(postId: string, userId: string) {
    return this.dataSource.query;
    /*PostLikeInfoModel.findOne({
      postId: postId,
      userId: userId,
    }).exec();*/
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
