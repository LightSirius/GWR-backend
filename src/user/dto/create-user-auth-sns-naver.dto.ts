import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserAuthSnsNaverDto {
  @ApiProperty({ description: 'sns_id' })
  @IsString()
  sns_id: string;
  @ApiProperty({ description: 'sns_access_token' })
  @IsString()
  sns_access_token: string;
  @ApiProperty({ description: 'sns_refresh_token' })
  @IsString()
  sns_refresh_token: string;
  @ApiProperty({ description: 'sns_access_token_expires' })
  @IsDate()
  @Type(() => Date)
  sns_access_token_expires: Date;
}
