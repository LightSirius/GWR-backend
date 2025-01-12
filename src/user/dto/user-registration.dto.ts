import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuthType } from '../entities/user-auth.entity';

export class UserRegistrationDto {
  @ApiProperty({ description: 'user_name' })
  @IsString()
  user_name: string;
  @ApiProperty({ description: 'user_gender' })
  @IsBoolean()
  user_gender: boolean;
  @ApiProperty({ description: 'user_born' })
  @IsDate()
  @Type(() => Date)
  user_born: Date;
  @ApiProperty({ description: 'user_email' })
  @IsEmail()
  user_email: string;
  @ApiProperty({ description: 'user_passid' })
  @IsString()
  user_ci: string;
  @ApiProperty({ description: 'phone_number' })
  @IsString()
  phone_number: string;
  @ApiProperty({ description: 'phone_sns_agree' })
  @IsBoolean()
  phone_sns_agree: boolean;
  @ApiProperty({ description: 'phone_sns_agree_date' })
  @IsDate()
  @Type(() => Date)
  phone_sns_agree_date: Date;
  @ApiProperty({ description: 'AuthType' })
  @IsEnum(AuthType)
  auth_type: AuthType;
  @ApiProperty({ description: 'auth_id' })
  @IsString()
  auth_id: string;
  @ApiProperty({ description: 'auth_password' })
  @IsString()
  // 숫자 1개 이상 포함, 대문자 1개 이상 포함, 소문자 1개 이상 포함, 특수문자 1개 이상 포함,8~20글자허용
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/)
  auth_password: string;
}
