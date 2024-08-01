import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserInputDto } from '../api/dto/input/user.input.dto';
import { UserOutputDto } from '../api/dto/output/user.output.dto';
import { User } from '../domain/user.entity';
import { BcryptService } from '../../../infrastructure/utils/services/bcrypt.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async createSuperUser(input: UserInputDto): Promise<UserOutputDto> {
    const passwordHash = await this.bcryptService.genHash(input.password);
    const createdUser = new User();
    createdUser.login = input.login;
    createdUser.passwordHash = passwordHash;
    createdUser.email = input.email;
    createdUser.emailConfirmation = {
      confirmationCode: undefined,
      expirationDate: undefined,
      isConfirmed: true,
    };
    createdUser.createdAt = new Date().toISOString();
    const insertedUser = await this.usersRepository.createUser(createdUser);
    return {
      id: insertedUser.id.toString(),
      login: createdUser.login,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.usersRepository.deleteUser(id);
    return result.deletedCount === 1;
  }
}
