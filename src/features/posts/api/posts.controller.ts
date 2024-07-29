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
} from '@nestjs/common';
import { PostsService } from '../applicarion/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { sortNPagingPostQuery } from '../../../base/types/query.mappers';
import { PostInputDto, PostInputQueryDto } from './dto/input/post.input.dto';
import { ObjectId } from 'mongodb';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(200)
  async findPosts(@Query() inputQuery: PostInputQueryDto) {
    const query = sortNPagingPostQuery(inputQuery);
    const posts = await this.postsQueryRepository.findPosts(query);
    return posts;
  }

  @Get(':postId')
  @HttpCode(200)
  async findPostById(@Param('postId') postId: string) {
    if (!ObjectId.isValid(postId)) {
      throw new NotFoundException();
    }
    const foundPost = await this.postsQueryRepository.findPostById(postId);
    if (!foundPost) {
      throw new NotFoundException();
    }
    return foundPost;
  }

  @Post()
  @HttpCode(201)
  async createPost(@Body() postInputDto: PostInputDto) {
    const newPost = await this.postsService.createPost(postInputDto);
    if (!newPost) {
      throw new NotFoundException();
    }
    return newPost;
  }

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
}
