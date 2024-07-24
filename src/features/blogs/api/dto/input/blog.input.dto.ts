import { SortDirection } from 'mongodb';

export class BlogInputDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export class BlogInputQueryDto {
  searchNameTerm: string | null;
  sortBy: string;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
}
