import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { BlogInputQueryDto } from '../api/dto/input/blog.input.dto';
import {
  BlogOutputDto,
  BlogOutputQueryDto,
} from '../api/dto/output/blog.output.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}
  async findBlogs(query: BlogInputQueryDto): Promise<BlogOutputQueryDto> {
    const search = query.searchNameTerm
      ? { name: { $regex: query.searchNameTerm, $options: 'i' } }
      : {};
    const items = await this.BlogModel.find(search)
      .sort({ [`${query.sortBy}`]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize as number)
      .exec();
    const totalCount = await this.BlogModel.countDocuments(search);
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
    const blog = await this.BlogModel.findOne({
      _id: new ObjectId(blogId),
    }).exec();
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
