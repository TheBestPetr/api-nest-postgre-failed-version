import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostInputQueryDto } from '../api/dto/input/post.input.dto';
import {
  PostOutputDto,
  PostOutputQueryDto,
} from '../api/dto/output/post.output.dto';
import { ObjectId } from 'mongodb';
import { PostsLikeInfoRepository } from './posts.like.info.repository';
import { LikeStatus } from '../../../base/types/like.statuses';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private readonly postsLikesInfoRepository: PostsLikeInfoRepository,
  ) {}
  async findPosts(
    query: PostInputQueryDto,
    userId?: string,
  ): Promise<PostOutputQueryDto> {
    const items = await this.PostModel.find()
      .sort({ [`${query.sortBy}`]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .exec();
    const totalCount = await this.PostModel.countDocuments();
    if (userId) {
      const itemsWitsStatusNNewestLikes = await Promise.all(
        items.map(async (post) => {
          const postLikesInfo =
            await this.postsLikesInfoRepository.findPostsLikesInfo(
              post._id.toString(),
              userId,
            );
          const newestLikes =
            await this.postsLikesInfoRepository.findNewestLikes(
              post._id.toString(),
            );
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
              myStatus: postLikesInfo?.status
                ? (postLikesInfo.status as LikeStatus)
                : 'None',
              newestLikes:
                newestLikes?.map((like) => ({
                  addedAt: like.createdAt,
                  userId: like.userId,
                  login: like.userLogin,
                })) || [],
            },
          };
        }),
      );
      return {
        pagesCount: Math.ceil(totalCount / query.pageSize),
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount as number,
        items: itemsWitsStatusNNewestLikes,
      };
    }
    const itemsWithNewestLikes = await Promise.all(
      items.map(async (post) => {
        const newestLikes = await this.postsLikesInfoRepository.findNewestLikes(
          post._id.toString(),
        );
        const status: LikeStatus = 'None';
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
            myStatus: status,
            newestLikes:
              newestLikes?.map((like) => ({
                addedAt: like.createdAt,
                userId: like.userId,
                login: like.userLogin,
              })) || [],
          },
        };
      }),
    );
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount as number,
      items: itemsWithNewestLikes,
    };
  }

  async findPostById(
    postId: string,
    userId?: string,
  ): Promise<PostOutputDto | null> {
    let postLikesInfo: LikeStatus = 'None';
    if (userId) {
      postLikesInfo = await this.postsLikesInfoRepository
        .findPostsLikesInfo(postId, userId)
        .then((res) => (res?.status as LikeStatus) ?? 'None');
    }
    const post = await this.PostModel.findOne({
      _id: new ObjectId(postId),
    }).exec();
    if (post) {
      const newestLikes =
        await this.postsLikesInfoRepository.findNewestLikes(postId);
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
          myStatus: postLikesInfo,
          newestLikes:
            newestLikes?.map((like) => ({
              addedAt: like.createdAt,
              userId: like.userId,
              login: like.userLogin,
            })) || [],
        },
      };
    }
    return null;
  }

  async findPostsByBlogIdInParams(
    query: PostInputQueryDto,
    blogId: string,
    userId?: string,
  ): Promise<PostOutputQueryDto> {
    const items = await this.PostModel.find({ blogId: blogId })
      .sort({ [`${query.sortBy}`]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .exec();
    const totalCount = await this.PostModel.countDocuments({ blogId: blogId });
    if (userId) {
      const itemsWitsStatusNNewestLikes = await Promise.all(
        items.map(async (post) => {
          const postLikesInfo =
            await this.postsLikesInfoRepository.findPostsLikesInfo(
              post._id.toString(),
              userId,
            );
          const newestLikes =
            await this.postsLikesInfoRepository.findNewestLikes(
              post._id.toString(),
            );
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
              myStatus: postLikesInfo?.status
                ? (postLikesInfo.status as LikeStatus)
                : 'None',
              newestLikes:
                newestLikes?.map((like) => ({
                  addedAt: like.createdAt,
                  userId: like.userId,
                  login: like.userLogin,
                })) || [],
            },
          };
        }),
      );
      return {
        pagesCount: Math.ceil(totalCount / query.pageSize),
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount as number,
        items: itemsWitsStatusNNewestLikes,
      };
    }
    const itemsWithNewestLikes = await Promise.all(
      items.map(async (post) => {
        const newestLikes = await this.postsLikesInfoRepository.findNewestLikes(
          post._id.toString(),
        );
        const status: LikeStatus = 'None';
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
            myStatus: status,
            newestLikes:
              newestLikes?.map((like) => ({
                addedAt: like.createdAt,
                userId: like.userId,
                login: like.userLogin,
              })) || [],
          },
        };
      }),
    );
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount as number,
      items: itemsWithNewestLikes,
    };
  }
}
