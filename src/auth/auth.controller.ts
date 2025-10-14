import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthLoginLocalDto } from './dto/auth-login-local.dto';
import { AuthLoginSnsNaverDto } from './dto/auth-login-sns-naver.dto';
import { AuthLoginChannelNaverRegisterDto } from './dto/auth-login-channel-naver-register.dto';
import { AuthLoginResponseDto } from './dto/auth-login.response.dto';

/**
 * 인증 컨트롤러
 * 로컬 및 소셜 로그인 엔드포인트를 제공합니다.
 */
@ApiTags('Auth API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * JWT 토큰 검증 및 사용자 정보 조회
   */
  @ApiOperation({ 
    summary: 'JWT 토큰 검증',
    description: 'JWT 토큰을 검증하고 인증된 사용자 정보를 반환합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '인증된 사용자 정보를 반환합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: '인증 실패 - 유효하지 않은 토큰',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('login')
  async verifyJwtToken(@Request() req) {
    return req.user;
  }

  /**
   * 로컬 로그인 (아이디/비밀번호)
   */
  @ApiOperation({ 
    summary: '로컬 로그인',
    description: '아이디와 비밀번호를 사용한 로컬 로그인을 처리합니다.',
  })
  @ApiBody({ type: AuthLoginLocalDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '로그인 성공 - JWT 액세스 토큰 반환',
    type: AuthLoginResponseDto,
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: '로그인 실패 - 아이디 또는 비밀번호가 올바르지 않음',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  async loginLocal(
    @Request() req,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginAuthDto: AuthLoginLocalDto,
  ): Promise<AuthLoginResponseDto> {
    return this.authService.login(req.user);
  }

  /**
   * 네이버 SNS 로그인
   */
  @ApiOperation({ 
    summary: '네이버 SNS 로그인',
    description: '네이버 OAuth 인증 코드를 사용하여 로그인을 처리합니다.',
  })
  @ApiBody({ type: AuthLoginSnsNaverDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '로그인 성공/실패 상태 및 JWT 토큰 반환',
    type: AuthLoginResponseDto,
  })
  @Post('login/sns/naver')
  async loginSnsNaver(
    @Body() authLoginSnsNaverDto: AuthLoginSnsNaverDto,
  ): Promise<AuthLoginResponseDto> {
    return this.authService.loginSnsNaver(authLoginSnsNaverDto);
  }

  /**
   * 네이버 SNS 로그인 URL 조회
   */
  @ApiOperation({ 
    summary: '네이버 SNS 로그인 URL 조회',
    description: '네이버 OAuth 로그인 페이지 URL을 반환합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '네이버 로그인 URL',
    schema: {
      properties: {
        url: { type: 'string', example: 'https://nid.naver.com/oauth2.0/authorize?...' }
      }
    }
  })
  @Get('login/sns/naver/url')
  @HttpCode(HttpStatus.OK)
  async getSnsNaverLoginUrl() {
    return {
      url: await this.authService.getSnsNaverUrl(),
    };
  }

  /**
   * 네이버 채널 로그인
   */
  @ApiOperation({ 
    summary: '네이버 채널 로그인',
    description: 'NHN AppGuard(네이버 채널) GDP_LOGIN 토큰으로 로그인을 처리합니다.',
  })
  @ApiBody({ 
    schema: {
      properties: {
        GDP_LOGIN: { type: 'string', description: 'NHN AppGuard GDP_LOGIN 토큰' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '로그인 성공/실패/미등록 상태 및 JWT 토큰 반환',
    type: AuthLoginResponseDto,
  })
  @Post('login/channel/naver')
  async loginChannelNaver(
    @Body() authLoginChannelNaverDto: { GDP_LOGIN: string },
  ): Promise<AuthLoginResponseDto> {
    return this.authService.loginChannelNaver(authLoginChannelNaverDto);
  }

  /**
   * 네이버 채널 로그인 URL 조회
   */
  @ApiOperation({ 
    summary: '네이버 채널 로그인 URL 조회',
    description: 'NHN AppGuard 로그인 페이지 URL을 반환합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '네이버 채널 로그인 URL',
    schema: {
      properties: {
        url: { type: 'string' }
      }
    }
  })
  @Get('login/channel/naver/url')
  @HttpCode(HttpStatus.OK)
  async getChannelNaverLoginUrl() {
    return {
      url: await this.authService.getChannelNaverUrl(),
    };
  }

  /**
   * 네이버 채널 회원가입 및 로그인
   */
  @ApiOperation({ 
    summary: '네이버 채널 회원가입 및 로그인',
    description: 'NHN AppGuard를 통한 신규 사용자 회원가입 및 로그인을 처리합니다.',
  })
  @ApiBody({ type: AuthLoginChannelNaverRegisterDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '회원가입 및 로그인 성공/실패 상태 및 JWT 토큰 반환',
    type: AuthLoginResponseDto,
  })
  @Post('login/channel/naver/register')
  async registerAndLoginChannelNaver(
    @Body() authLoginChannelNaverRegisterDto: AuthLoginChannelNaverRegisterDto,
  ): Promise<AuthLoginResponseDto> {
    return this.authService.loginChannelNaverRegister(
      authLoginChannelNaverRegisterDto,
    );
  }
}
