import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
  Request,
  Put,
  Body,
  ForbiddenException,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommentsService } from '../application/comments.service';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';
import { BearerAuthWithout401 } from '../../../infrastructure/decorators/bearer.auth.without.401';
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer.auth.guard';
import {
  CommentInputDto,
  CommentInputLikeStatusDto,
} from './dto/input/comment.input.dto';
import { LikeStatus } from '../../../base/types/like.statuses';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}
  @UseGuards(BearerAuthWithout401)
  @Get(':commentId')
  @HttpCode(200)
  async findCommentById(@Param('commentId') commentId: string, @Request() req) {
    const comment = await this.commentsQueryRepository.findCommentById(
      commentId,
      req.userId,
    );
    if (!comment) {
      throw new NotFoundException();
    }
    return comment;
  }

  @UseGuards(BearerAuthGuard)
  @Put(':commentId')
  @HttpCode(204)
  async updateComment(
    @Request() req,
    @Param('commentId') commentId: string,
    @Body() commentInputDto: CommentInputDto,
  ) {
    const comment =
      await this.commentsQueryRepository.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    const isUserCanDoThis = await this.commentsService.isUserCanDoThis(
      req.userId,
      commentId,
    );
    if (!isUserCanDoThis) {
      throw new ForbiddenException();
    }
    const updatedComment = await this.commentsService.update(
      commentInputDto,
      commentId,
    );
    if (!updatedComment) {
      throw new NotFoundException();
    }
  }

  @UseGuards(BearerAuthGuard)
  @Delete('commentId')
  @HttpCode(204)
  async deleteController(
    @Request() req,
    @Param('commentId') commentId: string,
  ) {
    const comment =
      await this.commentsQueryRepository.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    const isUserCanDoThis = await this.commentsService.isUserCanDoThis(
      req.userId,
      commentId,
    );
    if (!isUserCanDoThis) {
      throw new ForbiddenException();
    }
    const isDelete = await this.commentsService.delete(commentId);
    if (!isDelete) {
      throw new NotFoundException();
    }
  }

  @UseGuards(BearerAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(204)
  async updateCommentLikeStatus(
    @Request() req,
    @Param('commentId') commentId: string,
    @Body() inputLikeStatus: CommentInputLikeStatusDto,
  ) {
    const comment =
      await this.commentsQueryRepository.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    const isUpdate = await this.commentsService.updateLikeStatus(
      commentId,
      req.userId,
      inputLikeStatus.likeStatus as LikeStatus,
    );
    if (!isUpdate) {
      throw new InternalServerErrorException();
    }
  }
}
