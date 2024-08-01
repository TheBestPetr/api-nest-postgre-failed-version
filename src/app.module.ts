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
} from './features/auth/application/auth.custom.validators';
import { ReqIpCounter } from './infrastructure/guards/req-counter/req.ip.counter';

const blogsProviders = [BlogsRepository, BlogsService, BlogsQueryRepository];

const postsProviders = [PostsRepository, PostsService, PostsQueryRepository];

const usersProviders = [UsersRepository, UsersService, UsersQueryRepository];

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
      { name: ReqCount.name, schema: ReqCountSchema },
    ]),
  ],
  // Регистрация провайдеров
  providers: [
    ...blogsProviders,
    ...usersProviders,
    ...postsProviders,
    ...authProviders,
  ],
  // Регистрация контроллеров
  controllers: [
    UsersController,
    BlogsController,
    PostsController,
    AuthController,
    DeleteAllController,
  ],
})
export class AppModule {}
