import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RecommendDeleteDto {
  @ApiProperty({ description: 'board_id' })
  @IsNumber()
  board_id: number;
}
