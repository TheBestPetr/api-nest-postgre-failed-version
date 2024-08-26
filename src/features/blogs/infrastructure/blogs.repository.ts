import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../domain/blog.entity';
import { BlogInputDto } from '../api/dto/input/blog.input.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createBlog(input: Blog) {
    return this.dataSource.query(`
        INSERT INTO public.blogs(
            "name", "description", "websiteUrl", "createdAt", "isMembership")
            VALUES ('${input.name}', '${input.description}', '${input.websiteUrl}', new Date().toISOString(), false);`);
  }

  async updateBlog(blogId: string, input: BlogInputDto) {
    return this.dataSource.query(`
        UPDATE public.blogs
            SET "name" = '${input.name}', "description" = '${input.description}', "websiteUrl" = '${input.websiteUrl}'
            WHERE "id" = '${blogId}';`);
  }

  async deleteBlog(blogId: string) {
    return this.dataSource.query(`
        DELETE FROM public.blogs
            WHERE "id" = '${blogId}';`);
  }
}
