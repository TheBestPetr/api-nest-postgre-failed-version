import { SortDirection } from 'mongodb';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class UserInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 10)
  login: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches('[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
  email: string;
}

export class UserInputQueryDto {
  sortBy: string;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
}
