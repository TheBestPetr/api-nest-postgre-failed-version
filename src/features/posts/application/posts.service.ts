import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { ObjectId } from 'mongodb';
import {
  PostInputBlogDto,
  PostInputDto,
} from '../api/dto/input/post.input.dto';
import { PostOutputDto } from '../api/dto/output/post.output.dto';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';
import { Post } from '../domain/post.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async createPost(input: PostInputDto): Promise<PostOutputDto> {
    const blog = await this.blogsQueryRepository.findBlogById(input.blogId);
    const createdPost = new Post();
    createdPost.title = input.title;
    createdPost.shortDescription = input.shortDescription;
    createdPost.content = input.content;
    createdPost.blogId = new ObjectId(input.blogId).toString();
    createdPost.blogName = blog!.name;
    createdPost.createdAt = new Date().toISOString();
    createdPost.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };
    const insertedPost = await this.postsRepository.create(createdPost);
    return {
      id: insertedPost.id.toString(),
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      content: createdPost.content,
      blogId: createdPost.blogId,
      blogName: createdPost.blogName,
      createdAt: createdPost.createdAt,
      extendedLikesInfo: {
        likesCount: insertedPost.likesInfo.likesCount,
        dislikesCount: insertedPost.likesInfo.dislikesCount,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }

  async updatePost(postId: string, input: PostInputDto): Promise<boolean> {
    const result = await this.postsRepository.updatePost(postId, input);
    return result.matchedCount === 1;
  }

  async deletePost(postId: string): Promise<boolean> {
    const result = await this.postsRepository.deletePost(postId);
    return result.deletedCount === 1;
  }

  async createPostForBlogIdParams(
    blogId: string,
    input: PostInputBlogDto,
  ): Promise<PostOutputDto> {
    const blog = await this.blogsQueryRepository.findBlogById(blogId);
    const createdPost = new Post();
    createdPost.title = input.title;
    createdPost.shortDescription = input.shortDescription;
    createdPost.content = input.content;
    createdPost.blogId = new ObjectId(blogId).toString();
    createdPost.blogName = blog!.name;
    createdPost.createdAt = new Date().toISOString();
    createdPost.likesInfo = { likesCount: 0, dislikesCount: 0 };

    const insertedPost = await this.postsRepository.create(createdPost);
    return {
      id: insertedPost.id.toString(),
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      content: createdPost.content,
      blogId: createdPost.blogId,
      blogName: createdPost.blogName,
      createdAt: createdPost.createdAt,
      extendedLikesInfo: {
        likesCount: insertedPost.likesInfo.likesCount,
        dislikesCount: insertedPost.likesInfo.dislikesCount,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
}
