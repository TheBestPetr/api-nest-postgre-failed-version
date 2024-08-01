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

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    }).exec();
  }

  async findUserByEmailConfirmationCode(code: string) {
    const user = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    }).exec();
    if (user) {
      return user;
    }
    return null;
  }

  async updateUserEmailConfirmation(id: string, input: any) {
    return this.UserModel.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...input,
        },
      },
    ).exec();
  }

  async findUserByPasswordRecoveryCode(code: string) {
    const user = await this.UserModel.findOne({
      'passwordRecovery.recoveryCode': code,
    }).exec();
    if (user) {
      return user;
    }
    return null;
  }

  async passwordRecoveryConfirmation(email: string, input: any) {
    return this.UserModel.updateOne(
      { email: email },
      {
        $set: {
          ...input,
        },
      },
    );
  }

  async updatePasswordRecovery(
    userId: string,
    newPasswordHash: string,
    input: any,
  ) {
    return this.UserModel.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          passwordHash: newPasswordHash,
          ...input,
        },
      },
    ).exec();
  }
}
