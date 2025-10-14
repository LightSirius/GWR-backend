import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * 로컬 로그인 요청 DTO
 */
export class AuthLoginLocalDto {
  @ApiProperty({ 
    description: '사용자 아이디',
    example: 'user123',
    minLength: 4,
    maxLength: 20,
  })
  @IsNotEmpty({ message: '아이디를 입력해주세요.' })
  @IsString()
  @MinLength(4, { message: '아이디는 최소 4자 이상이어야 합니다.' })
  @MaxLength(20, { message: '아이디는 최대 20자까지 가능합니다.' })
  auth_id: string;

  @ApiProperty({ 
    description: '사용자 비밀번호',
    example: 'password123!',
    minLength: 8,
  })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  auth_password: string;
}
