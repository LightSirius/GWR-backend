import { ApiProperty } from '@nestjs/swagger';
import { AuthType } from '../../user/entities/user-auth.entity';

/**
 * JWT 토큰 페이로드 DTO
 * JWT 토큰에 포함될 사용자 정보를 정의합니다.
 */
export class AuthTokenPayloadDto {
  @ApiProperty({ 
    description: '사용자 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({ 
    description: '대표 캐릭터 CUID',
    example: 12345,
    nullable: true,
  })
  cuid: number | null;

  @ApiProperty({ 
    description: '인증 타입',
    enum: AuthType,
    example: AuthType.Local,
  })
  type: AuthType;
}
