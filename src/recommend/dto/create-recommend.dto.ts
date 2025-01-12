import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateRecommendDto {
  @ApiProperty({ description: 'board_id' })
  @IsNumber()
  board_id: number;
  @ApiProperty({ description: 'user_uuid' })
  @IsString()
  user_uuid: string;
}
