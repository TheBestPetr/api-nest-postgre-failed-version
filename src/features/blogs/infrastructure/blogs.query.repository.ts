import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogInputQueryDto } from '../api/dto/input/blog.input.dto';
import {
  BlogOutputDto,
  BlogOutputQueryDto,
} from '../api/dto/output/blog.output.dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findBlogs(query: BlogInputQueryDto): Promise<BlogOutputQueryDto> {
    const search = query.searchNameTerm
      ? { name: { $regex: query.searchNameTerm, $options: 'i' } }
      : {};
    const items = await this.dataSource.query(`
        SELECT id, name, description, "websiteUrl", "createdAt", "isMembership"
        FROM public.blogs
        WHERE "name" ILIKE '%${search}%'
        ORDER BY "createdAt" ${query.sortBy}
        LIMIT ${query.pageSize} OFFSET ${(query.pageNumber - 1) * query.pageSize}
    `);
    const totalCount = await this.dataSource.query(
      `SELECT COUNT (*) FROM public.blogs`,
    );
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount as number,
      items: items.map((blog) => ({
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        isMembership: blog.isMembership,
        createdAt: blog.createdAt,
      })),
    };
  }

  async findBlogById(blogId: string): Promise<BlogOutputDto | null> {
    const blog = await this.dataSource.query(`
        SELECT id, name, description, "websiteUrl", "createdAt", "isMembership"
        FROM public.blogs
        WHERE "id" = '${blogId}';`);
    if (blog) {
      return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        isMembership: blog.isMembership,
        createdAt: blog.createdAt,
      };
    } else {
      return null;
    }
  }
}
