import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import {
  PostInputBlogDto,
  PostInputDto,
} from '../api/dto/input/post.input.dto';
import { PostOutputDto } from '../api/dto/output/post.output.dto';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query.repository';
import { Post, PostLikesCount } from '../domain/post.entity';
import { PostsLikeInfoRepository } from '../infrastructure/posts.like.info.repository';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { PostLikeEntity } from '../domain/post.like.entity';
import { LikeStatus } from '../../../base/types/like.statuses';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsLikeInfoRepository: PostsLikeInfoRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  async createPost(input: PostInputDto): Promise<PostOutputDto> {
    const blog = await this.blogsQueryRepository.findBlogById(input.blogId);

    const createdPost = new Post();
    createdPost.title = input.title;
    createdPost.shortDescription = input.shortDescription;
    createdPost.content = input.content;
    createdPost.blogId = input.blogId;
    createdPost.blogName = blog!.name;
    createdPost.createdAt = new Date().toISOString();

    const postLikesCount = new PostLikesCount();
    postLikesCount.likesCount = 0;
    postLikesCount.dislikesCount = 0;

    const insertedPost = await this.postsRepository.createPost(createdPost);
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
    createdPost.blogId = blogId;
    createdPost.blogName = blog!.name;
    createdPost.createdAt = new Date().toISOString();
    createdPost.likesInfo = { likesCount: 0, dislikesCount: 0 };

    const insertedPost = await this.postsRepository.createPost(createdPost);
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

  async updateLikeStatus(
    postId: string,
    userId: string,
    inputLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const postLikesInfo = await this.postsLikeInfoRepository.findPostsLikesInfo(
      postId,
      userId,
    );
    const user = await this.usersQueryRepository.findUserById(userId);
    if (!postLikesInfo?.status) {
      const newPostLikeInfo = new PostLikeEntity();
      newPostLikeInfo.postId = postId;
      newPostLikeInfo.userId = userId;
      newPostLikeInfo.userLogin = user!.login;
      newPostLikeInfo.status = inputLikeStatus as string;
      newPostLikeInfo.createdAt = new Date().toISOString();
      const createLikeInfo =
        await this.postsLikeInfoRepository.createNewLikeInfo(newPostLikeInfo);
      const updateLikesCount =
        await this.postsRepository.updateAddPostLikesCount(
          postId,
          inputLikeStatus,
        );
      return createLikeInfo && updateLikesCount;
    }
    const updateLikeInfo =
      await this.postsLikeInfoRepository.updatePostLikeInfo(
        postId,
        userId,
        inputLikeStatus,
      );
    const updateLikesCount =
      await this.postsRepository.updateExistPostLikesCount(
        postId,
        postLikesInfo.status as LikeStatus,
        inputLikeStatus,
      );
    return updateLikeInfo && updateLikesCount;
  }
}
