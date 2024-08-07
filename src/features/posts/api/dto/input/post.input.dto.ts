import { SortDirection } from 'mongodb';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { LikeStatus } from '../../../../../base/types/like.statuses';

export class PostInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  content: string;

  @IsString()
  @IsNotEmpty()
  blogId: string;
}

export class PostInputLikeStatusDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(None|Like|Dislike)$/)
  likeStatus: LikeStatus;
}

export class PostInputQueryDto {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
}

export class PostInputBlogDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  content: string;
}
