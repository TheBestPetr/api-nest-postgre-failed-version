import { SortDirection } from 'mongodb';

export class PostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class PostInputQueryDto {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
}

export class PostInputBlogDto {
  title: string;
  shortDescription: string;
  content: string;
}
