import { ApiProperty } from '@nestjs/swagger';

export class AuthLoginLocalDto {
  @ApiProperty({ description: 'auth_id' })
  auth_id: string;
  @ApiProperty({ description: 'auth_password' })
  auth_password: string;
}
