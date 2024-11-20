import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'auth_id',
      passwordField: 'auth_password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const auth = await this.authService.validateLocal(username, password);
    if (!auth) {
      throw new UnauthorizedException();
    }
    return auth;
  }
}
