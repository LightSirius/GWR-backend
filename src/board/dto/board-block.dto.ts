import { BoardType } from '../entities/board.entity';

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';

export class BoardBlockDto {
  @ApiProperty({ description: 'board_type' })
  @IsEnum(BoardType)
  board_type: BoardType;
  @ApiProperty({ description: 'board_id' })
  @IsNumber()
  board_id: number;
}
