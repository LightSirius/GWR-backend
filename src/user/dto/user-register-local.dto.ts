import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEmail, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class UserRegisterLocalDto {
  @ApiProperty({ description: 'token_version_id' })
  @IsString()
  token_version_id: string;
  @ApiProperty({ description: 'enc_data' })
  @IsString()
  enc_data: string;
  @ApiProperty({ description: 'user_email' })
  @IsEmail()
  user_email: string;
  @ApiProperty({ description: 'phone_sns_agree' })
  @IsBoolean()
  phone_sns_agree: boolean;
  @ApiProperty({ description: 'phone_sns_agree_date' })
  @IsDate()
  @Type(() => Date)
  phone_sns_agree_date: Date;
  @ApiProperty({ description: 'auth_id' })
  @IsString()
  auth_id: string;
  @ApiProperty({ description: 'auth_password' })
  @IsString()
  // 숫자 1개 이상 포함, 대문자 1개 이상 포함, 소문자 1개 이상 포함, 특수문자 1개 이상 포함,8~20글자허용
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/)
  auth_password: string;
}
