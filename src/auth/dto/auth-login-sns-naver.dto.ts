import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 네이버 SNS 로그인 요청 DTO
 */
export class AuthLoginSnsNaverDto {
  @ApiProperty({ 
    description: '네이버 OAuth 인증 코드',
    example: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ',
  })
  @IsNotEmpty({ message: '인증 코드를 입력해주세요.' })
  @IsString()
  code: string;

  @ApiProperty({ 
    description: 'OAuth state 값 (CSRF 방지)',
    example: 'TESTSTATE',
  })
  @IsNotEmpty({ message: 'State 값을 입력해주세요.' })
  @IsString()
  state: string;
}
