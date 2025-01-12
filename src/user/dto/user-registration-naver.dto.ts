import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserRegistrationNaverDto {
  @ApiProperty({ description: 'user_nickname' })
  @IsString()
  user_nickname: string;
  @ApiProperty({ description: 'phone_sns_agree_date' })
  @IsDate()
  @Type(() => Date)
  phone_sns_agree_date: Date;
  @ApiProperty({ description: 'user_email' })
  @IsEmail()
  user_email: string;
  @ApiProperty({ description: 'user_name' })
  @IsString()
  user_name: string;
  @ApiProperty({ description: 'user_born' })
  @IsDate()
  @Type(() => Date)
  user_born: Date;
  @ApiProperty({ description: 'user_gender' })
  @IsBoolean()
  user_gender: boolean;
  @ApiProperty({ description: 'user_passid' })
  @IsString()
  user_ci: string;
  @ApiProperty({ description: 'naver_memberno' })
  @IsNumber()
  naver_memberno: number;
}
