import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UserModifyCuidDto {
  @ApiProperty({ description: 'cuid' })
  @IsNumber()
  cuid: number;
}
