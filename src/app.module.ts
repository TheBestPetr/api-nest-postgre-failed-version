import { Module } from '@nestjs/common';
import { PostsService } from './features/posts/application/posts.service';
import { PostsController } from './features/posts/api/posts.controller';
import { CommentsService } from './features/comments/application/comments.service';
import { CommentsController } from './features/comments/api/comments.controller';
import { blogIdIsExist } from './infrastructure/decorators/blogId.custom.decorator';
import { DevicesService } from './features/securityDevices/application/devices.service';
import { DevicesController } from './features/securityDevices/api/devices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogModule } from './features/blogs/blog.module';
import { UserModule } from './features/users/user.module';
import { AuthModule } from './features/auth/auth.module';

const postsProviders = [PostsService, blogIdIsExist];

const commentsProvider = [CommentsService];

const devicesProviders = [DevicesService];

@Module({
  // Регистрация модулей
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'sa',
      database: 'HwNest',
      autoLoadEntities: false,
      synchronize: false,
    }),
    BlogModule,
    UserModule,
    AuthModule,
  ],

  providers: [...postsProviders, ...commentsProvider, ...devicesProviders],

  controllers: [PostsController, CommentsController, DevicesController],
})
export class AppModule {}
