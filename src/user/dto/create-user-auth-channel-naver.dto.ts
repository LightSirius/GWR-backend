import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateUserAuthChannelNaverDto {
  @ApiProperty({ description: 'channel_ipd_custno' })
  @IsNumber()
  channel_ipd_custno: number;
  @ApiProperty({ description: 'channel_memberno' })
  @IsNumber()
  channel_memberno: number;
  @ApiProperty({ description: 'channel_access_token' })
  @IsString()
  channel_access_token: string;
  @ApiProperty({ description: 'channel_refresh_token' })
  @IsString()
  channel_refresh_token: string;
  // @ApiProperty({ description: 'channel_access_token_expires' })
  // @IsDate()
  // @Type(() => Date)
  // channel_access_token_expires: Date;
}
