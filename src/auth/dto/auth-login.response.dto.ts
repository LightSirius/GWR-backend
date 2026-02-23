import { ApiProperty } from '@nestjs/swagger';
import { AuthType } from '../../user/entities/user-auth.entity';

/**
 * 로그인 상태 타입
 */
export enum StatusType {
  'success' = 0,        // 로그인 성공
  'unregistered' = 1,   // 미등록 사용자
  'fail' = 2,           // 로그인 실패
  'error' = 3,          // 에러 발생
  'transfer_account' = 4, // 계정 이전 필요
}

/**
 * 인증 로그인 응답 DTO
 */
export class AuthLoginResponseDto {
  @ApiProperty({ 
    description: '인증 타입',
    enum: AuthType,
    example: AuthType.Local,
  })
  authType: AuthType;

  @ApiProperty({ 
    description: '로그인 상태',
    enum: StatusType,
    example: StatusType.success,
  })
  status: StatusType;

  @ApiProperty({ 
    description: 'JWT 액세스 토큰 (로그인 성공 시에만 포함)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  access_token?: string;
}
