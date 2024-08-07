import { SortDirection } from 'mongodb';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { LikeStatus } from '../../../../../base/types/like.statuses';

export class CommentInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300)
  content: string;
}

export class CommentInputLikeStatusDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(None|Like|Dislike)$/)
  likeStatus: LikeStatus;
}

export class CommentInputQueryDto {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
}
