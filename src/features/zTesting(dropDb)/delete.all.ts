import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../users/domain/user.entity';
import { Blog, BlogModelType } from '../blogs/domain/blog.entity';
import { Post, PostModelType } from '../posts/domain/post.entity';
import {
  ReqCount,
  ReqCountModelType,
} from '../../infrastructure/guards/req-counter/req.ip.count.entity';
import { Comment, CommentModelType } from '../comments/domain/comment.entity';
import {
  PostLikeEntity,
  PostLikeInfoModelType,
} from '../posts/domain/post.like.entity';
import {
  CommentLikeEntity,
  CommentLikeInfoModelType,
} from '../comments/domain/comment.like.entity';
import {
  Device,
  DeviceModelType,
} from '../securityDevices/domain/device.entity';
import {
  RefreshTokenBlacklistModelType,
  RefreshTokenEntity,
} from '../auth/domain/refresh.token.entity';

@Controller('testing/all-data')
export class DeleteAllController {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLikeEntity.name)
    private PostLikeInfoModel: PostLikeInfoModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLikeEntity.name)
    private CommentLikeInfoModel: CommentLikeInfoModelType,
    @InjectModel(ReqCount.name)
    private readonly ReqCountModel: ReqCountModelType,
    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    @InjectModel(RefreshTokenEntity.name)
    private RefreshTokenBlacklistModel: RefreshTokenBlacklistModelType,
  ) {}
  @Delete()
  @HttpCode(204)
  async deleteAll() {
    await this.UserModel.deleteMany();
    await this.BlogModel.deleteMany();
    await this.PostModel.deleteMany();
    await this.PostLikeInfoModel.deleteMany();
    await this.CommentModel.deleteMany();
    await this.CommentLikeInfoModel.deleteMany();
    await this.ReqCountModel.deleteMany();
    await this.DeviceModel.deleteMany();
    await this.RefreshTokenBlacklistModel.deleteMany();
  }
}
