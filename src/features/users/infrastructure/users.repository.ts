import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async createUser(input: User) {
    return this.UserModel.create(input);
  }

  async deleteUser(id: string) {
    return this.UserModel.deleteOne({ _id: new ObjectId(id) }).exec();
  }

  /*async updateEmailConfirmation(id: string, input: Object) {
    return UserModel.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...input,
        },
      },
    );
  }*/

  /*async passwordRecoveryConfirmation(email: string, input: Object) {
    return UserModel.updateOne(
      { email: email },
      {
        $set: {
          ...input,
        },
      },
    );
  }*/

  /*async updatePasswordRecovery(
    userId: string,
    newPasswordHash: string,
    input: Object,
  ) {
    return UserModel.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          passwordHash: newPasswordHash,
          ...input,
        },
      },
    );
  }*/
}
