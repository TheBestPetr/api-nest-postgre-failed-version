import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { UsersQueryRepository } from './features/users/infrastructure/users.query.repository';
import { User, UserSchema } from './features/users/domain/user.entity';
import { UsersController } from './features/users/api/users.controller';
import { UsersService } from './features/users/application/users.service';
import { SETTINGS } from './settings/app.settings';
import { DeleteAllController } from './features/zTesting(dropDb)/delete.all';
import { Blog, BlogSchema } from './features/blogs/domain/blog.entity';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { BlogsService } from './features/blogs/application/blogs.service';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query.repository';
import { BlogsController } from './features/blogs/api/blogs.controller';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { PostsService } from './features/posts/application/posts.service';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query.repository';
import { Post, PostSchema } from './features/posts/domain/post.entity';
import { PostsController } from './features/posts/api/posts.controller';
import { AuthController } from './features/auth/api/auth.controller';
import { AuthService } from './features/auth/application/auth.service';
import { BcryptService } from './infrastructure/utils/services/bcrypt.service';
import { NodemailerService } from './infrastructure/utils/services/nodemailer.service';
import { JwtService } from './infrastructure/utils/services/jwt.service';
import { BearerAuthGuard } from './infrastructure/guards/bearer.auth.guard';
import {
  ReqCount,
  ReqCountSchema,
} from './infrastructure/guards/req-counter/req.ip.count.entity';
import {
  emailConfirmationCodeIsExist,
  emailIsExist,
  emailResendingIsEmailConfirmed,
  loginIsExist,
  passwordRecoveryCodeIsExist,
} from './infrastructure/decorators/auth.custom.decorator';
import { ReqIpCounter } from './infrastructure/guards/req-counter/req.ip.counter';
import { CommentsService } from './features/comments/application/comments.service';
import { CommentsRepository } from './features/comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query.repository';
import {
  Comment,
  CommentSchema,
} from './features/comments/domain/comment.entity';
import {
  CommentLikeEntity,
  CommentLikeSchema,
} from './features/comments/domain/comment.like.entity';
import { CommentsLikeInfoRepository } from './features/comments/infrastructure/comments.like.info.repository';
import { PostsLikeInfoRepository } from './features/posts/infrastructure/posts.like.info.repository';
import {
  PostLikeEntity,
  PostLikeSchema,
} from './features/posts/domain/post.like.entity';
import { CommentsController } from './features/comments/api/comments.controller';
import { blogIdIsExist } from './infrastructure/decorators/blogId.custom.decorator';

const blogsProviders = [BlogsRepository, BlogsService, BlogsQueryRepository];

const postsProviders = [
  PostsRepository,
  PostsService,
  PostsQueryRepository,
  blogIdIsExist,
];

const usersProviders = [
  UsersRepository,
  UsersService,
  UsersQueryRepository,
  PostsLikeInfoRepository,
];

const commentsProvider = [
  CommentsService,
  CommentsRepository,
  CommentsQueryRepository,
  CommentsLikeInfoRepository,
];

const authProviders = [
  AuthService,
  BearerAuthGuard,
  JwtService,
  NodemailerService,
  BcryptService,
  passwordRecoveryCodeIsExist,
  loginIsExist,
  emailIsExist,
  emailConfirmationCodeIsExist,
  emailResendingIsEmailConfirmed,
  ReqIpCounter,
];

@Module({
  // Регистрация модулей
  imports: [
    MongooseModule.forRoot(SETTINGS.MONGO_URL, { dbName: 'nest' }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([
      { name: PostLikeEntity.name, schema: PostLikeSchema },
    ]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([
      { name: CommentLikeEntity.name, schema: CommentLikeSchema },
    ]),
    MongooseModule.forFeature([
      { name: ReqCount.name, schema: ReqCountSchema },
    ]),
  ],

  providers: [
    ...blogsProviders,
    ...usersProviders,
    ...postsProviders,
    ...authProviders,
    ...commentsProvider,
  ],

  controllers: [
    UsersController,
    BlogsController,
    PostsController,
    AuthController,
    CommentsController,
    DeleteAllController,
  ],
})
export class AppModule {}
