import {
  Get,
  Body,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UserInputDto, UserInputQueryDto } from './dto/input/user.input.dto';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { sortNPagingUserQuery } from '../../../infrastructure/utils/query.mappers';
import { BasicAuthGuard } from '../../../infrastructure/guards/basic.auth.guard';

@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  @HttpCode(200)
  async findUsers(@Query() inputQuery: UserInputQueryDto) {
    const query = sortNPagingUserQuery(inputQuery);
    const users = await this.usersQueryRepository.findUsers(query);
    return users;
  }

  @Post()
  @HttpCode(201)
  async createUser(@Body() userInputDto: UserInputDto) {
    const newUser = await this.usersService.createSuperUser(userInputDto);
    return newUser;
    /*if (!newUser) {
      throw new Error('400');
    }*/
  }

  @Delete(':userId')
  @HttpCode(204)
  async deleteUser(@Param('userId') userId: string) {
    const isDelete: boolean = await this.usersService.deleteUser(userId);
    if (!isDelete) {
      throw new NotFoundException();
    }
  }
}
