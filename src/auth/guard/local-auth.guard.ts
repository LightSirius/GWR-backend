import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 로컬 인증 가드
 * 아이디/비밀번호 기반 인증을 처리합니다.
 * 
 * @example
 * ```typescript
 * @UseGuards(LocalAuthGuard)
 * @Post('login')
 * async login(@Request() req, @Body() loginDto: LoginDto) {
 *   return this.authService.login(req.user);
 * }
 * ```
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
