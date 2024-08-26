import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EmailConfirmation,
  PasswordRecovery,
  User,
} from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUser(inputUser: User, inputEmailConfirmation: EmailConfirmation) {
    const createdUser = await this.dataSource.query(`
        INSERT INTO public.users(
            login, 
            "passwordHash", 
            email, 
            "createdAt")
            VALUES (
                '${inputUser.login}',
                '${inputUser.passwordHash}',
                '${inputUser.email}',
                 ${inputUser.createdAt});
    `);
    await this.dataSource.query(`
        INSERT INTO public."usersEmailConfirmation"(
            "userId",
            "confirmationCode",
            "expirationDate",
            "isConfirmed")
            VALUES (
                '${createdUser.id}',
                '${inputEmailConfirmation.confirmationCode}',
                 ${inputEmailConfirmation.expirationDate},
                 ${inputEmailConfirmation.isConfirmed});
    `);
    return createdUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.dataSource.query(`
        DELETE FROM public.users
            WHERE "id" = '${id}';
    `);
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return this.dataSource.query(`
        SELECT 
            id, 
            login, 
            "passwordHash", 
            email, 
            "createdAt"
            FROM public.users
            WHERE "login" = '${loginOrEmail}' OR 
                  "email" = '${loginOrEmail}'
    `);
  }

  async findUserEmailConfirmationInfo(loginOrEmail: string) {
    const user = await this.dataSource.query(`
        SELECT 
            id, 
            login, 
            "passwordHash", 
            email, 
            "createdAt"
            FROM public.users
            WHERE "login" = '${loginOrEmail}' OR 
                  "email" = '${loginOrEmail}'
    `);
    if (user) {
      return this.dataSource.query(`
        SELECT "userId", "confirmationCode", "expirationDate", "isConfirmed"
            FROM public."usersEmailConfirmation"
            WHERE "userId" = '${user.id}'
        `);
    }
    return false;
  }

  async findUserByEmailConfirmationCode(
    code: string,
  ): Promise<EmailConfirmation | null> {
    return this.dataSource.query(`
        SELECT 
            "userId", 
            "confirmationCode", 
            "expirationDate", 
            "isConfirmed"
            FROM public."usersEmailConfirmation"
            WHERE "confirmationCode" = '${code}'
    `);
  }

  async updateAccessUserEmailConfirmation(id: string): Promise<boolean> {
    const result = await this.dataSource.query(`
        UPDATE public."usersEmailConfirmation"
            SET 
                "confirmationCode" = 'null', 
                "expirationDate" = null, 
                "isConfirmed" = true
                WHERE "id" = '${id}';`);
    return !!result;
  }

  async updateUserEmailConfirmation(
    id: string,
    inputEmailConfirmation: EmailConfirmation,
  ): Promise<boolean> {
    const result = await this.dataSource.query(`
        UPDATE public."usersEmailConfirmation"
            SET 
                "confirmationCode" = '${inputEmailConfirmation.confirmationCode}', 
                "expirationDate" = ${inputEmailConfirmation.expirationDate}
                WHERE "id" = '${id}';`);
    return !!result;
  }

  async findUserByPasswordRecoveryCode(code: string) {
    return this.dataSource.query(`
        SELECT "userId", "recoveryCode", "expirationDate"
        FROM public."usersPasswordRecovery"
        WHERE "recoveryCode" = '${code}'
    `);
  }

  async passwordRecoveryConfirmation(
    email: string,
    inputPasswordRecovery: PasswordRecovery,
  ) {
    return this.dataSource.query(`
    UPDATE public."usersPasswordRecovery"
            SET "confirmationCode" = '${inputPasswordRecovery.recoveryCode}', 
            "expirationDate" = ${inputPasswordRecovery.expirationDate}
            WHERE "email" = '${email}';
    `);
  }

  async updatePasswordRecovery(
    userId: string,
    newPasswordHash: string,
    input: PasswordRecovery,
  ): Promise<boolean> {
    const isPasswordHashUpdated = await this.dataSource.query(`
      UPDATE public.users
            SET "passwordHash" = '${newPasswordHash}'
            WHERE "id" = '${userId}';`);
    const isPasswordRecoveryUpdated = await this.dataSource.query(`
        UPDATE public."usersPasswordRecovery"
            SET "recoveryCode" = '${input.recoveryCode}', "expirationDate" = ${input.expirationDate}
            WHERE "userId" = '${userId}';`);
    return isPasswordHashUpdated || isPasswordRecoveryUpdated;
  }
}
