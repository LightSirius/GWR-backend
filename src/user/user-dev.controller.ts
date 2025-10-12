import {
  Controller,
  Get,
  Query,
  Redirect,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { UserService } from './user.service';

/**
 * 개발 환경 전용 컨트롤러
 * 프로덕션 환경에서는 이 컨트롤러를 비활성화해야 합니다.
 * 
 * 환경 변수 설정:
 * NODE_ENV=production 일 때 이 컨트롤러를 모듈에서 제외하세요.
 */
@ApiTags('Development/Testing API (개발용)')
@Controller('user/dev')
export class UserDevController {
  constructor(private readonly userService: UserService) {}

  /**
   * NHN API 테스트 - 사용자 정보 조회
   */
  @ApiOperation({ 
    summary: '[DEV] NHN 사용자 정보 조회',
    description: '개발 환경에서 NHN API 테스트를 위한 엔드포인트입니다.',
  })
  @Get('nhn/user')
  getNhnUser(@Query('token') token: string) {
    return this.userService.getNhnUser(token);
  }

  /**
   * NHN API 테스트 - 멤버 상태 조회
   */
  @ApiOperation({ 
    summary: '[DEV] NHN 멤버 상태 조회',
    description: '개발 환경에서 NHN API 멤버 상태 테스트를 위한 엔드포인트입니다.',
  })
  @Get('nhn/member')
  getNhnMember(@Query('login') login: string) {
    return this.userService.getNhnMember(login);
  }

  /**
   * NHN 회원가입 URL 리다이렉트
   */
  @ApiOperation({ 
    summary: '[DEV] NHN 회원가입 URL 리다이렉트',
    description: '개발 환경에서 NHN 회원가입 테스트를 위한 엔드포인트입니다.',
  })
  @Redirect('')
  @Get('nhn/registration/url')
  async getNhnRegistrationUrl() {
    return { url: await this.userService.getNhnRegistrationUrl() };
  }
}

