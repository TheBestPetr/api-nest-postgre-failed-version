import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { ObjectId } from 'mongodb';
import { PostInputDto } from '../api/dto/input/post.input.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
  async create(input: Post) {
    return this.PostModel.create(input);
  }

  async updatePost(postId: string, input: PostInputDto) {
    return this.PostModel.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          ...input,
          blogId: new ObjectId(input.blogId).toString(),
        },
      },
    ).exec();
  }

  async deletePost(postId: string) {
    return this.PostModel.deleteOne({ _id: new ObjectId(postId) }).exec();
  }
}
