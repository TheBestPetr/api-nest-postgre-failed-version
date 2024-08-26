import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findUsers() {}

  async findUserById(userId: string) {
    const user = await this.dataSource.query(
      `SELECT *
        FROM public.users
        WHERE "id" = '${userId}';`,
    );
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
