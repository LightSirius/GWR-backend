import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AttendanceListDto {
  @ApiProperty({ description: 'year' })
  @IsNumber()
  year: number;
  @ApiProperty({ description: 'month' })
  @IsNumber()
  month: number;
}
