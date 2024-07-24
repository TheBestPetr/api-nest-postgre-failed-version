import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostInputQueryDto } from '../api/dto/input/post.input.dto';
import {
  PostOutputDto,
  PostOutputQueryDto,
} from '../api/dto/output/post.output.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
  async findPosts(query: PostInputQueryDto): Promise<PostOutputQueryDto> {
    const items = await this.PostModel.find()
      .sort({ [`${query.sortBy}`]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .exec();
    const totalCount = await this.PostModel.countDocuments();
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount as number,
      items: items.map((post) => ({
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.likesInfo.likesCount,
          dislikesCount: post.likesInfo.dislikesCount,
          myStatus: 'None',
          newestLikes: [],
        },
      })),
    };
  }

  async findPostById(postId: string): Promise<PostOutputDto | null> {
    const post = await this.PostModel.findOne({
      _id: new ObjectId(postId),
    }).exec();
    if (post) {
      return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.likesInfo.likesCount,
          dislikesCount: post.likesInfo.dislikesCount,
          myStatus: 'None',
          newestLikes: [],
        },
      };
    }
    return null;
  }

  async findPostsByBlogIdInParams(
    query: PostInputQueryDto,
    blogId: string,
  ): Promise<PostOutputQueryDto> {
    const items = await this.PostModel.find({ blogId: blogId })
      .sort({ [`${query.sortBy}`]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .exec();
    const totalCount = await this.PostModel.countDocuments({ blogId: blogId });
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount as number,
      items: items.map((post) => ({
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.likesInfo.likesCount,
          dislikesCount: post.likesInfo.dislikesCount,
          myStatus: 'None',
          newestLikes: [],
        },
      })),
    };
  }
}
