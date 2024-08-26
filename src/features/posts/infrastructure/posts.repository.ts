import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../domain/post.entity';
import { PostInputDto } from '../api/dto/input/post.input.dto';
import { LikeStatus } from '../../../base/types/like.statuses';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async createPost(input: Post) {
    return this.dataSource.query(`
        INSERT INTO public.posts( 
            title, 
            "shortDescription", 
            content, 
            "blogId", 
            "blogName", 
            "createdAt")
            VALUES (
                '${input.title}', 
                '${input.shortDescription}', 
                '${input.content}', 
                '${input.blogId}', 
                '${input.blogName}', 
                 ${input.createdAt}
            );
    `);
  }

  async updatePost(postId: string, input: PostInputDto) {
    return this;
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
