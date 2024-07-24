import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersRepository } from './features/users/infrastructure/users.repository';
import { UsersQueryRepository } from './features/users/infrastructure/users.query.repository';
import { User, UserSchema } from './features/users/domain/user.entity';
import { UsersController } from './features/users/api/users.controller';
import { UsersService } from './features/users/applicarion/users.service';
import { SETTINGS } from './settings/app.settings';
import { DeleteAllController } from './features/zTesting(dropDb)/delete.all';
import { Blog, BlogSchema } from './features/blogs/domain/blog.entity';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { BlogsService } from './features/blogs/applicarion/blogs.service';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query.repository';
import { BlogsController } from './features/blogs/api/blogs.controller';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { PostsService } from './features/posts/applicarion/posts.service';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query.repository';
import { Post, PostSchema } from './features/posts/domain/post.entity';
import { PostsController } from './features/posts/api/posts.controller';

const blogsProviders = [BlogsRepository, BlogsService, BlogsQueryRepository];

const postsProviders = [PostsRepository, PostsService, PostsQueryRepository];

const usersProviders = [UsersRepository, UsersService, UsersQueryRepository];

@Module({
  // Регистрация модулей
  imports: [
    MongooseModule.forRoot(SETTINGS.MONGO_URL, { dbName: 'nest' }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  // Регистрация провайдеров
  providers: [...blogsProviders, ...usersProviders, ...postsProviders],
  // Регистрация контроллеров
  controllers: [
    UsersController,
    BlogsController,
    PostsController,
    DeleteAllController,
  ],
})
export class AppModule {}
