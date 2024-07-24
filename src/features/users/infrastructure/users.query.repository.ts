import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { UserInputQueryDto } from '../api/dto/input/user.input.dto';
import { UserOutputQueryDto } from '../api/dto/output/user.output.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findUsers(query: UserInputQueryDto): Promise<UserOutputQueryDto> {
    const searchWithEmail = query.searchEmailTerm
      ? { email: { $regex: query.searchEmailTerm, $options: 'i' } }
      : {};
    const searchWithLogin = query.searchLoginTerm
      ? { login: { $regex: query.searchLoginTerm, $options: 'i' } }
      : {};
    const items = await this.UserModel.find({
      $or: [searchWithEmail, searchWithLogin],
    })
      .sort({ [`${query.sortBy}`]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .exec();

    const totalCount = await this.UserModel.countDocuments({
      $or: [searchWithEmail, searchWithLogin],
    });
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount as number,
      items: items.map((user) => ({
        id: user._id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      })),
    };
  }

  async findUserById(userId: string) {
    const user = await this.UserModel.findOne({ _id: new ObjectId(userId) });
    if (user) {
      return user;
    }
    return false;
  }
}
