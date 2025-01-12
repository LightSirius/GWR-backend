import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserModifyPhoneDto {
  @ApiProperty({ description: 'token_version_id' })
  @IsString()
  token_version_id: string;
  @ApiProperty({ description: 'enc_data' })
  @IsString()
  enc_data: string;
}
