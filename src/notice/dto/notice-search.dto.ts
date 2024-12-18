import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { NoticeType } from '../entities/notice.entity';

export enum SearchType {
  'title',
  'contents',
}

export enum SortType {
  'newest',
  'score',
}

export class NoticeSearchDto {
  @ApiProperty({ description: 'notice_type' })
  @IsEnum(NoticeType)
  @IsOptional()
  notice_type?: NoticeType;
  @ApiProperty({ description: 'search_page' })
  @IsNumber()
  search_page: number;
  @ApiProperty({ description: 'search_string' })
  @IsString()
  @IsOptional()
  search_string?: string;
  @ApiProperty({
    description: 'search_type<br>0: title<br>1: contents',
  })
  @IsEnum(SearchType)
  @IsOptional()
  search_type?: SearchType;
  @ApiProperty({ description: 'search_size' })
  @IsNumber()
  @IsOptional()
  search_size?: number;
  @ApiProperty({ description: 'sort_type<br>0: newest<br>1: score' })
  @IsEnum(SortType)
  sort_type: SortType;
}