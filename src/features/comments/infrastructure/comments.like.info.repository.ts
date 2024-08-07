import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLikeEntity,
  CommentLikeInfoModelType,
} from '../domain/comment.like.entity';
import { LikeStatus } from '../../../base/types/like.statuses';
import { WithId } from 'mongodb';

@Injectable()
export class CommentsLikeInfoRepository {
  constructor(
    @InjectModel(CommentLikeEntity.name)
    private CommentLikeInfoModel: CommentLikeInfoModelType,
  ) {}
  async findCommentsLikesInfo(
    commentId: string,
    userId: string,
  ): Promise<WithId<CommentLikeEntity> | null> {
    return this.CommentLikeInfoModel.findOne({
      commentId: commentId,
      userId: userId,
    }).exec();
    /*    if (result) {
      return result;
    }
    return null;*/
  }

  async createNewLikeInfo(
    commentLikeInfo: CommentLikeEntity,
  ): Promise<boolean> {
    const result = await this.CommentLikeInfoModel.create(commentLikeInfo);
    return !!result;
  }

  async updateCommentLikeInfo(
    commentId: string,
    userId: string,
    newStatus: LikeStatus,
  ): Promise<boolean> {
    const result = await this.CommentLikeInfoModel.updateOne(
      { commentId: commentId, userId: userId },
      { $set: { status: newStatus } },
    ).exec();
    return result.matchedCount === 1;
  }
}
