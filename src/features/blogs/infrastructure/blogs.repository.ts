import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { ObjectId } from 'mongodb';
import { BlogInputDto } from '../api/dto/input/blog.input.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async createBlog(input: Blog) {
    return this.BlogModel.create({ ...input });
  }

  async updateBlog(blogId: string, input: BlogInputDto) {
    return this.BlogModel.updateOne(
      { _id: new ObjectId(blogId) },
      { $set: { ...input } },
    ).exec();
  }

  async deleteBlog(blogId: string) {
    return this.BlogModel.deleteOne({ _id: new ObjectId(blogId) }).exec();
  }
}
