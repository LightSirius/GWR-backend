import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 네이버 채널 회원가입 요청 DTO
 */
export class AuthLoginChannelNaverRegisterDto {
  @ApiProperty({ 
    description: 'NHN AppGuard 인증 코드',
    example: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ',
  })
  @IsNotEmpty({ message: '인증 코드를 입력해주세요.' })
  @IsString()
  code: string;

  @ApiProperty({ 
    description: 'OAuth state 값 (CSRF 방지)',
    example: 'aaaaaaaaaaaa',
  })
  @IsNotEmpty({ message: 'State 값을 입력해주세요.' })
  @IsString()
  state: string;
}
