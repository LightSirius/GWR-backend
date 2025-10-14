import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenPayloadDto } from '../dto/auth-token-payload.dto';

/**
 * JWT 검증 결과 인터페이스
 */
export interface IJwtValidationResult {
  uuid: string;
  cuid: number | null;
  type: string;
}

/**
 * JWT 인증 전략 (Passport JWT Strategy)
 * Bearer 토큰을 검증하고 사용자 정보를 추출합니다.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  /**
   * JWT 페이로드를 검증하고 사용자 정보를 반환합니다.
   * @param payload - JWT 토큰 페이로드
   * @returns 검증된 사용자 정보 (uuid, cuid, type)
   */
  async validate(payload: AuthTokenPayloadDto): Promise<IJwtValidationResult> {
    return { 
      uuid: payload.uuid, 
      cuid: payload.cuid, 
      type: payload.type.toString(),
    };
  }
}
