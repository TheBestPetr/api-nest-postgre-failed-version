import { SortDirection } from 'mongodb';

export class UserInputDto {
  login: string;
  password: string;
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
