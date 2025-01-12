import { CreateUserAuthLocalDto } from './create-user-auth-local.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuthType } from '../entities/user-auth.entity';
import { CreateUserAuthSnsNaverDto } from './create-user-auth-sns-naver.dto';
import { CreateUserAuthChannelNaverDto } from './create-user-auth-channel-naver.dto';

export class CreateUserDto {
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
  @ApiProperty({ description: 'member_uuid' })
  @IsNumber()
  member_uuid: number;
  @ApiProperty({ description: 'AuthType' })
  @IsEnum(AuthType)
  auth_type: AuthType;
  @ApiProperty({ description: 'CreateUserAuthLocalDto' })
  @IsOptional()
  userAuthLocal?: CreateUserAuthLocalDto;
  @ApiProperty({ description: 'CreateUserAuthSnsNaverDto' })
  @IsOptional()
  userAuthSnsNaver?: CreateUserAuthSnsNaverDto;
  @ApiProperty({ description: 'CreateUserAuthChannelNaverDto' })
  @IsOptional()
  userAuthChannelNaver?: CreateUserAuthChannelNaverDto;
}
