import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentInputDto } from '../api/dto/input/comment.input.dto';
import { CommentOutputDto } from '../api/dto/output/comment.output.dto';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repository';
import { Comment } from '../domain/comment.entity';
import { AuthIOutputDto } from '../../auth/api/dto/output/auth.output.dto';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';
import { LikeStatus } from '../../../base/types/like.statuses';
import { CommentsLikeInfoRepository } from '../infrastructure/comments.like.info.repository';
import { CommentLikeEntity } from '../domain/comment.like.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commentLikeInfoRepository: CommentsLikeInfoRepository,
  ) {}

  async createComment(
    input: CommentInputDto,
    commentatorId: string,
    postId: string,
  ): Promise<CommentOutputDto> {
    const user = await this.usersQueryRepository.findUserById(commentatorId);
    const { userId, login } = user as AuthIOutputDto;
    const newComment = new Comment();
    newComment.postId = postId;
    newComment.content = input.content;
    newComment.commentatorInfo = {
      userId: userId,
      userLogin: login,
    };
    newComment.createdAt = new Date().toISOString();
    newComment.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };
    const insertedComment =
      await this.commentsRepository.createComment(newComment);
    return {
      id: insertedComment._id.toString(),
      content: newComment.content,
      commentatorInfo: {
        userId: userId,
        userLogin: login,
      },
      createdAt: newComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }

  async update(input: CommentInputDto, commentId: string): Promise<boolean> {
    const result = await this.commentsRepository.updateComment(
      input,
      commentId,
    );
    return result.matchedCount === 1;
  }

  async delete(commentId: string): Promise<boolean> {
    const result = await this.commentsRepository.delete(commentId);
    return result.deletedCount === 1;
  }

  async isUserCanDoThis(userId: string, commentId: string): Promise<boolean> {
    const comment =
      await this.commentsQueryRepository.findCommentById(commentId);
    return userId === comment?.commentatorInfo.userId;
  }

  async updateLikeStatus(
    commentId: string,
    userId: string,
    inputLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const commentLikeInfo =
      await this.commentLikeInfoRepository.findCommentsLikesInfo(
        commentId,
        userId,
      );
    if (!commentLikeInfo?.status) {
      const newCommentLikeInfo = new CommentLikeEntity();
      newCommentLikeInfo.commentId = commentId;
      newCommentLikeInfo.userId = userId;
      newCommentLikeInfo.status = inputLikeStatus;
      newCommentLikeInfo.createdAt = new Date().toISOString();
      const createLikeInfo =
        await this.commentLikeInfoRepository.createNewLikeInfo(
          newCommentLikeInfo,
        );
      const updateLikesCount =
        await this.commentsRepository.updateAddCommentLikesCount(
          commentId,
          inputLikeStatus,
        );
      return createLikeInfo && updateLikesCount;
    }
    const updateLikeInfo =
      await this.commentLikeInfoRepository.updateCommentLikeInfo(
        commentId,
        userId,
        inputLikeStatus,
      );
    const updateLikesCount =
      await this.commentsRepository.updateExistCommentLikesCount(
        commentId,
        commentLikeInfo.status as LikeStatus,
        inputLikeStatus,
      );
    return updateLikeInfo && updateLikesCount;
  }
}
