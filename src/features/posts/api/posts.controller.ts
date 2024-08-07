import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import {
  sortNPagingCommentQuery,
  sortNPagingPostQuery,
} from '../../../infrastructure/utils/query.mappers';
import {
  PostInputDto,
  PostInputLikeStatusDto,
  PostInputQueryDto,
} from './dto/input/post.input.dto';
import { ObjectId } from 'mongodb';
import {
  CommentInputDto,
  CommentInputQueryDto,
} from '../../comments/api/dto/input/comment.input.dto';
import { BearerAuthGuard } from '../../../infrastructure/guards/bearer.auth.guard';
import { CommentsService } from '../../comments/application/comments.service';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository';
import { BasicAuthGuard } from '../../../infrastructure/guards/basic.auth.guard';
import { BearerAuthWithout401 } from '../../../infrastructure/decorators/bearer.auth.without.401';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsService: CommentsService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get()
  @HttpCode(200)
  async findPosts(@Query() inputQuery: PostInputQueryDto) {
    const query = sortNPagingPostQuery(inputQuery);
    const posts = await this.postsQueryRepository.findPosts(query);
    return posts;
  }

  @UseGuards(BearerAuthWithout401)
  @Get(':postId')
  @HttpCode(200)
  async findPostById(@Request() req, @Param('postId') postId: string) {
    const foundPost = await this.postsQueryRepository.findPostById(
      postId,
      req.userId,
    );
    if (!foundPost) {
      throw new NotFoundException();
    }
    return foundPost;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  async createPost(@Body() postInputDto: PostInputDto) {
    const newPost = await this.postsService.createPost(postInputDto);
    if (!newPost) {
      throw new NotFoundException();
    }
    return newPost;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':postId')
  @HttpCode(204)
  async updatePost(
    @Param('postId') postId: string,
    @Body() postInputDto: PostInputDto,
  ) {
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException();
    }
    const updatedPost = await this.postsService.updatePost(
      postId,
      postInputDto,
    );
    if (!updatedPost) {
      throw new NotFoundException();
    }
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':postId')
  @HttpCode(204)
  async deletePost(@Param('postId') postId: string) {
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException();
    }
    const isDelete = await this.postsService.deletePost(postId);
    if (!isDelete) {
      throw new NotFoundException();
    }
  }

  @UseGuards(BearerAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(204)
  async updatePostLikeStatus(
    @Request() req,
    @Param('postId') postId: string,
    @Body() inputLikeType: PostInputLikeStatusDto,
  ) {
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const isUpdate = await this.postsService.updateLikeStatus(
      postId,
      req.userId,
      inputLikeType.likeStatus,
    );
    if (!isUpdate) {
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(BearerAuthGuard)
  @Post(':postId/comments')
  @HttpCode(201)
  async createComment(
    @Request() req,
    @Param('postId') postId: string,
    @Body() commentInputDto: CommentInputDto,
  ) {
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const commentatorId = req.userId;
    const comment = await this.commentsService.createComment(
      commentInputDto,
      commentatorId,
      postId,
    );
    return comment;
  }

  @UseGuards(BearerAuthWithout401)
  @Get(':postId/comments')
  @HttpCode(200)
  async findCommentsByPostIdInParams(
    @Param('postId') postId: string,
    @Query() inputQuery: CommentInputQueryDto,
    @Request() req,
  ) {
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const query = sortNPagingCommentQuery(inputQuery);
    const comments = await this.commentsQueryRepository.findCommentsByPostId(
      postId,
      query,
      req.userId,
    );
    return comments;
  }
}
