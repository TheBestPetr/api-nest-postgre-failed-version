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
import { BlogsQueryRepository } from '../infrastructure/blogs.query.repository';
import { BlogsService } from '../applicarion/blogs.service';
import { BlogInputDto, BlogInputQueryDto } from './dto/input/blog.input.dto';
import {
  sortNPagingBlogQuery,
  sortNPagingPostQuery,
} from '../../../base/types/query.mappers';
import {
  PostInputBlogDto,
  PostInputQueryDto,
} from '../../posts/api/dto/input/post.input.dto';
import { PostsService } from '../../posts/applicarion/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query.repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(200)
  async findBlogs(@Query() inputQuery: BlogInputQueryDto) {
    const query = sortNPagingBlogQuery(inputQuery);
    const blogs = await this.blogsQueryRepository.findBlogs(query);
    return blogs;
  }

  @Get(':blogId')
  @HttpCode(200)
  async findBlogById(@Param('blogId') blogId: string) {
    const foundBlog = await this.blogsQueryRepository.findBlogById(blogId);
    if (!foundBlog) {
      throw new NotFoundException();
    }
    return foundBlog;
  }

  @Post()
  @HttpCode(201)
  async createBlogController(@Body() blogInputDto: BlogInputDto) {
    const newBlog = await this.blogsService.createBlog(blogInputDto);
    return newBlog;
  }

  @Put(':blogId')
  @HttpCode(204)
  async updateBlogController(
    @Param('blogId') blogId: string,
    @Body() blogInputDto: BlogInputDto,
  ) {
    const updatedBlog = await this.blogsService.updateBlog(
      blogId,
      blogInputDto,
    );
    if (!updatedBlog) {
      throw new NotFoundException();
    }
  }

  @Delete(':blogId')
  @HttpCode(204)
  async deleteBlogController(@Param('blogId') blogId: string) {
    const isDelete = await this.blogsService.deleteBlog(blogId);
    if (!isDelete) {
      throw new NotFoundException();
    }
  }

  @Get(':blogId/posts')
  @HttpCode(200)
  async findPostsByBlogIdInParams(
    @Query() inputQuery: PostInputQueryDto,
    @Param('blogId') blogId: string,
  ) {
    const isBlogExist = await this.blogsQueryRepository.findBlogById(blogId);
    if (!isBlogExist) {
      throw new NotFoundException();
    }
    const query = sortNPagingPostQuery(inputQuery);
    const foundPosts =
      await this.postsQueryRepository.findPostsByBlogIdInParams(query, blogId);
    if (!foundPosts) {
      throw new NotFoundException();
    }
    return foundPosts;
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostByBlogIdInParams(
    @Param('blogId') blogId: string,
    @Body() postInputBlogDto: PostInputBlogDto,
  ) {
    const isBlogExist = await this.blogsQueryRepository.findBlogById(blogId);
    if (!isBlogExist) {
      throw new NotFoundException();
    }
    const newPost = await this.postsService.createPostForBlogIdParams(
      blogId,
      postInputBlogDto,
    );
    if (!newPost) {
      throw new NotFoundException();
    }
    return newPost;
  }
}
