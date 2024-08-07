import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { CommentInputDto } from '../api/dto/input/comment.input.dto';
import { ObjectId } from 'mongodb';
import { LikeStatus } from '../../../base/types/like.statuses';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}
  async createComment(input: Comment) {
    return this.CommentModel.create(input);
  }

  async updateComment(input: CommentInputDto, commentId: string) {
    return this.CommentModel.updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { content: input.content } },
    ).exec();
  }

  async delete(commentId: string) {
    return this.CommentModel.deleteOne({ _id: new ObjectId(commentId) }).exec();
  }

  async updateAddCommentLikesCount(
    commentId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    if (likeStatus === 'Like') {
      await this.CommentModel.updateOne(
        { _id: new ObjectId(commentId) },
        { $inc: { 'likesInfo.likesCount': 1 } },
      ).exec();
      return true;
    }
    if (likeStatus === 'Dislike') {
      await this.CommentModel.updateOne(
        { _id: new ObjectId(commentId) },
        { $inc: { 'likesInfo.dislikesCount': 1 } },
      ).exec();
      return true;
    }
    return false;
  }

  async updateExistCommentLikesCount(
    commentId: string,
    oldStatus: LikeStatus,
    newStatus: LikeStatus,
  ): Promise<boolean> {
    if (oldStatus === 'Like' && newStatus === 'Dislike') {
      await this.CommentModel.updateOne(
        { _id: new ObjectId(commentId) },
        { $inc: { 'likesInfo.likesCount': -1, 'likesInfo.dislikesCount': 1 } },
      ).exec();
      return true;
    }
    if (oldStatus === 'Like' && newStatus === 'None') {
      await this.CommentModel.updateOne(
        { _id: new ObjectId(commentId) },
        { $inc: { 'likesInfo.likesCount': -1 } },
      ).exec();
      return true;
    }
    if (oldStatus === 'Dislike' && newStatus === 'Like') {
      await this.CommentModel.updateOne(
        { _id: new ObjectId(commentId) },
        { $inc: { 'likesInfo.likesCount': 1, 'likesInfo.dislikesCount': -1 } },
      ).exec();
      return true;
    }
    if (oldStatus === 'Dislike' && newStatus === 'None') {
      await this.CommentModel.updateOne(
        { _id: new ObjectId(commentId) },
        { $inc: { 'likesInfo.dislikesCount': -1 } },
      ).exec();
      return true;
    }
    return oldStatus === newStatus;
  }
}
