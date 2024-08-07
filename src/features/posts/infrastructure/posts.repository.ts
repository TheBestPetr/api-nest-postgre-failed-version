import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { ObjectId } from 'mongodb';
import { PostInputDto } from '../api/dto/input/post.input.dto';
import { LikeStatus } from '../../../base/types/like.statuses';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
  async createPost(input: Post) {
    return this.PostModel.create(input);
  }

  async updatePost(postId: string, input: PostInputDto) {
    return this.PostModel.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          ...input,
          blogId: new ObjectId(input.blogId).toString(),
        },
      },
    ).exec();
  }

  async deletePost(postId: string) {
    return this.PostModel.deleteOne({ _id: new ObjectId(postId) }).exec();
  }

  async updateAddPostLikesCount(
    postId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    if (likeStatus === 'Like') {
      await this.PostModel.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { 'likesInfo.likesCount': 1 } },
      ).exec();
      return true;
    }
    if (likeStatus === 'Dislike') {
      await this.PostModel.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { 'likesInfo.dislikesCount': 1 } },
      ).exec();
      return true;
    }
    return false;
  }

  async updateExistPostLikesCount(
    postId: string,
    oldStatus: LikeStatus,
    newStatus: LikeStatus,
  ): Promise<boolean> {
    if (oldStatus === 'Like' && newStatus === 'Dislike') {
      await this.PostModel.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { 'likesInfo.likesCount': -1, 'likesInfo.dislikesCount': 1 } },
      ).exec();
      return true;
    }
    if (oldStatus === 'Like' && newStatus === 'None') {
      await this.PostModel.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { 'likesInfo.likesCount': -1 } },
      ).exec();
      return true;
    }
    if (oldStatus === 'Dislike' && newStatus === 'Like') {
      await this.PostModel.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { 'likesInfo.likesCount': 1, 'likesInfo.dislikesCount': -1 } },
      ).exec();
      return true;
    }
    if (oldStatus === 'Dislike' && newStatus === 'None') {
      await this.PostModel.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { 'likesInfo.dislikesCount': -1 } },
      ).exec();
      return true;
    }
    return oldStatus === newStatus;
  }
}
