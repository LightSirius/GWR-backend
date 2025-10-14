import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserAuth } from '../../user/entities/user-auth.entity';

/**
 * 로컬 인증 전략 (Passport Local Strategy)
 * 아이디와 비밀번호를 사용한 인증을 처리합니다.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'auth_id',
      passwordField: 'auth_password',
    });
  }

  /**
   * 사용자 인증 정보를 검증합니다.
   * @param username - 사용자 아이디
   * @param password - 사용자 비밀번호
   * @returns 인증된 UserAuth 객체
   * @throws UnauthorizedException - 인증 실패 시
   */
  async validate(username: string, password: string): Promise<UserAuth> {
    const auth = await this.authService.validateLocal(username, password);
    if (!auth) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    return auth;
  }
}
