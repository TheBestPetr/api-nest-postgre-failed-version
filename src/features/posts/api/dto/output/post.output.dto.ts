import { ExtendedLikesInfo } from '../../../../../base/types/like.entity';

export class PostOutputDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
}

export class PostOutputQueryDto {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostOutputDto>;
}
