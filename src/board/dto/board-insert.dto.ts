import { BoardType } from '../entities/board.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class BoardInsertDto {
  @ApiProperty({ description: 'board_type' })
  @IsEnum(BoardType)
  board_type: BoardType;
  @ApiProperty({ description: 'board_category' })
  @IsNumber()
  board_category: number;
  @ApiProperty({ description: 'board_title' })
  @IsString()
  board_title: string;
  @ApiProperty({ description: 'board_contents' })
  @IsString()
  board_contents: string;
  @ApiProperty({ description: 'board_contents_es' })
  @IsString()
  board_contents_es: string;
}
