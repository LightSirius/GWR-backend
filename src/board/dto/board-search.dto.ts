import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BoardType } from '../entities/board.entity';

export enum SearchType {
  'title',
  'contents',
  'username',
}
export enum SortType {
  'newest',
  'score',
}

export class BoardSearchDto {
  @ApiProperty({ description: 'board_type' })
  @IsEnum(BoardType)
  board_type: BoardType;
  @ApiProperty({ description: 'board_category' })
  @IsNumber()
  board_category: number;
  @ApiProperty({ description: 'search_page' })
  @IsNumber()
  search_page: number;
  @ApiProperty({ description: 'search_string' })
  @IsString()
  @IsOptional()
  search_string?: string;
  @ApiProperty({
    description: 'search_type<br>0: title<br>1: contents<br>2: username',
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
