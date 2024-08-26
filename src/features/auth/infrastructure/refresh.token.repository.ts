import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class RefreshTokenRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async addTokenInBlacklist(token: string) {
    await this.dataSource.query(`
        INSERT INTO public."refreshTokenBlacklist"(
            token
        )
        VALUES (${token});
    `);
  }

  async isTokenInBlacklist(token: string) {
    const isTokenExist = await this.dataSource.query(`
        SELECT token
            FROM public."refreshTokenBlacklist"
            WHERE "token" = '${token}'`);
    return !!isTokenExist;
  }
}
