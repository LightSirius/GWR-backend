import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginChannelNaverRegisterDto {
  @ApiProperty({ description: 'code' })
  code: string;
  @ApiProperty({ description: 'state' })
  state: string;
}
