import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { CommentInputQueryDto } from '../api/dto/input/comment.input.dto';
import {
  CommentOutputDto,
  CommentOutputQueryDto,
} from '../api/dto/output/comment.output.dto';
import { JwtService } from '../../../infrastructure/utils/services/jwt.service';
import { CommentsLikeInfoRepository } from './comments.like.info.repository';
import { ObjectId } from 'mongodb';
import { LikeStatus } from '../../../base/types/like.statuses';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private readonly jwtService: JwtService,
    private readonly commentLikesInfoRepository: CommentsLikeInfoRepository,
  ) {}
  async findCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentOutputDto | null> {
    let status: LikeStatus = 'None';
    if (userId) {
      status = await this.commentLikesInfoRepository
        .findCommentsLikesInfo(commentId, userId)
        .then((result) => (result?.status as LikeStatus) ?? 'None');
    }
    const comment = await this.CommentModel.findOne({
      _id: new ObjectId(commentId),
    }).exec();
    if (comment) {
      return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId,
          userLogin: comment.commentatorInfo.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesInfo.likesCount,
          dislikesCount: comment.likesInfo.dislikesCount,
          myStatus: status ? status : 'None',
        },
      };
    }
    return null;
  }

  async findCommentsByPostId(
    postId: string,
    query: CommentInputQueryDto,
    userId?: string,
  ): Promise<CommentOutputQueryDto> {
    const items = await this.CommentModel.find({ postId: postId })
      .sort({ [`${query.sortBy}`]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .exec();
    const totalCount = await this.CommentModel.countDocuments({
      postId: postId,
    });
    if (userId) {
      const itemsWithStatus: CommentOutputDto[] = await Promise.all(
        items.map(async (comment): Promise<CommentOutputDto> => {
          const commentLikeInfo =
            await this.commentLikesInfoRepository.findCommentsLikesInfo(
              comment._id.toString(),
              userId,
            );
          return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
              userId: comment.commentatorInfo.userId,
              userLogin: comment.commentatorInfo.userLogin,
            },
            createdAt: comment.createdAt,
            likesInfo: {
              likesCount: comment.likesInfo.likesCount,
              dislikesCount: comment.likesInfo.dislikesCount,
              myStatus: commentLikeInfo?.status
                ? (commentLikeInfo.status as LikeStatus)
                : 'None',
            },
          };
        }),
      );
      return {
        pagesCount: Math.ceil(totalCount / query.pageSize),
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount as number,
        items: itemsWithStatus,
      };
    }
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount as number,
      items: items.map((comment) => ({
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId,
          userLogin: comment.commentatorInfo.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesInfo.likesCount,
          dislikesCount: comment.likesInfo.dislikesCount,
          myStatus: 'None',
        },
      })),
    };
  }
}
