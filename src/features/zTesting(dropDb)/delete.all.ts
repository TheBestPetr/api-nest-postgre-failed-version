import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../users/domain/user.entity';
import { Blog } from '../blogs/domain/blog.entity';
import { Post, PostModelType } from '../posts/domain/post.entity';
import {
  ReqCount,
  ReqCountModelType,
} from '../../infrastructure/guards/req-counter/req.ip.count.entity';

@Controller('testing/all-data')
export class DeleteAllController {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Blog.name) private BlogModel: UserModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(ReqCount.name)
    private readonly ReqCountModel: ReqCountModelType,
  ) {}
  @Delete()
  @HttpCode(204)
  async deleteAll() {
    await this.UserModel.deleteMany();
    await this.BlogModel.deleteMany();
    await this.PostModel.deleteMany();
    await this.ReqCountModel.deleteMany();
  }
}
