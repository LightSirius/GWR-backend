import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginSnsNaverDto {
  @ApiProperty({ description: 'code' })
  code: string;
  @ApiProperty({ description: 'state' })
  state: string;
}
