import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogInputDto } from '../api/dto/input/blog.input.dto';
import { BlogOutputDto } from '../api/dto/output/blog.output.dto';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async createBlog(input: BlogInputDto): Promise<BlogOutputDto> {
    const createdBlog = new Blog();
    createdBlog.name = input.name;
    createdBlog.description = input.description;
    createdBlog.websiteUrl = input.websiteUrl;
    createdBlog.createdAt = new Date().toISOString();
    createdBlog.isMembership = false;
    const insertedBlog = await this.blogsRepository.createBlog(createdBlog);
    return {
      id: insertedBlog.id.toString(),
      name: createdBlog.name,
      description: createdBlog.description,
      websiteUrl: createdBlog.websiteUrl,
      createdAt: createdBlog.createdAt,
      isMembership: createdBlog.isMembership,
    };
  }

  async updateBlog(blogId: string, input: BlogInputDto) {
    const result = await this.blogsRepository.updateBlog(blogId, input);
    return result.matchedCount === 1;
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    const result = await this.blogsRepository.deleteBlog(blogId);
    return result.deletedCount === 1;
  }
}
