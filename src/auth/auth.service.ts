import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { comparePassword } from '../utils/bcrypt';
import { AuthType, UserAuth } from '../user/entities/user-auth.entity';
import { AuthLoginSnsNaverDto } from './dto/auth-login-sns-naver.dto';
import { User } from '../user/entities/user.entity';
import {
  AuthLoginResponseDto,
  StatusType,
} from './dto/auth-login.response.dto';
import { AuthLoginChannelNaverRegisterDto } from './dto/auth-login-channel-naver-register.dto';
import { AuthTokenPayloadDto } from './dto/auth-token-payload.dto';
import { 
  NAVER_OAUTH, 
  OAUTH_STATE, 
  NAVER_CHANNEL_ERROR_CODE 
} from './constants/auth.constants';

/**
 * 인증 서비스
 * 로컬 및 소셜 로그인 처리, JWT 토큰 발급을 담당합니다.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 로컬 사용자 인증 정보를 검증합니다.
   * @param authId - 사용자 ID
   * @param authPassword - 사용자 비밀번호
   * @returns 인증 성공 시 UserAuth 객체, 실패 시 null
   */
  async validateLocal(
    authId: string,
    authPassword: string,
  ): Promise<UserAuth | null> {
    const auth = await this.userService.findAuthLocalToId(authId);
    if (auth && (await comparePassword(authPassword, auth.auth_password))) {
      this.logger.debug(`Local authentication successful for user: ${authId}`);
      return auth.userAuth;
    }
    this.logger.warn(`Local authentication failed for user: ${authId}`);
    return null;
  }

  /**
   * 인증된 사용자에 대해 로그인 처리를 수행하고 JWT 토큰을 발급합니다.
   * @param auth - 인증된 사용자 정보 (UserAuth)
   * @returns 로그인 성공 정보 및 액세스 토큰이 담긴 AuthLoginResponseDto
   */
  async login(auth: UserAuth): Promise<AuthLoginResponseDto> {
    const user: User = await this.userService.findOneToAuth(auth);
    const payload: AuthTokenPayloadDto = {
      uuid: user.user_uuid,
      cuid: user.member_cuid,
      type: user.userAuth.auth_type,
    };

    this.logger.log(`User logged in successfully: ${user.user_uuid}`);

    const data: AuthLoginResponseDto = {
      authType: AuthType.Local,
      status: StatusType.success,
      access_token: this.jwtService.sign(payload),
    };
    return data;
  }

  /**
   * 네이버 SNS 로그인 페이지 URL을 생성하여 반환합니다.
   * @returns 네이버 SNS 로그인 URL 문자열
   */
  async getSnsNaverUrl(): Promise<string> {
    const url = 
      `${NAVER_OAUTH.AUTHORIZE_URL}?response_type=code` +
      `&client_id=${this.configService.getOrThrow('SNS_NAVER_API_CLIENT_ID')}` +
      `&redirect_uri=${this.configService.getOrThrow('SNS_NAVER_API_REDIRECT_URI')}` +
      `&state=${OAUTH_STATE.DEFAULT}`;
    
    this.logger.debug('SNS Naver login URL generated');
    return url;
  }

  /**
   * 네이버 SNS 로그인을 처리하고 결과를 반환합니다.
   * @param authLoginSnsNaverDto - 네이버 SNS 로그인에 필요한 코드와 상태 정보
   * @returns 로그인 처리 결과(성공, 실패 등) 및 액세스 토큰(성공 시)이 담긴 AuthLoginResponseDto
   */
  async loginSnsNaver(
    authLoginSnsNaverDto: AuthLoginSnsNaverDto,
  ): Promise<AuthLoginResponseDto> {
    const user = await this.userService.authLoginSnsNaver(authLoginSnsNaverDto);
    
    if (user === -1) {
      this.logger.error('SNS Naver login failed');
      const data: AuthLoginResponseDto = {
        authType: AuthType.SnsNaver,
        status: StatusType.error,
      };
      return data;
    }

    this.logger.log(`SNS Naver user logged in: ${user.user_uuid}`);

    const payload: AuthTokenPayloadDto = {
      uuid: user.user_uuid,
      cuid: null,
      type: user.userAuth.auth_type,
    };

    const data: AuthLoginResponseDto = {
      authType: AuthType.SnsNaver,
      status: StatusType.success,
      access_token: this.jwtService.sign(payload),
    };
    return data;
  }

  /**
   * 네이버 채널링 서비스(예: NHN AppGuard) 등록/로그인 URL을 반환합니다.
   * @returns 네이버 채널링 서비스 URL 문자열
   */
  async getChannelNaverUrl(): Promise<string> {
    this.logger.debug('Channel Naver registration URL requested');
    return await this.userService.getNhnRegistrationUrl();
  }

  /**
   * 네이버 채널링 서비스(예: NHN AppGuard) 로그인을 처리하고 결과를 반환합니다.
   * @param authLoginChannelNaverDto - GDP_LOGIN 토큰을 포함한 객체
   * @returns 로그인 처리 결과(성공, 실패, 미등록 등) 및 액세스 토큰(성공 시)이 담긴 AuthLoginResponseDto
   */
  async loginChannelNaver(
    authLoginChannelNaverDto: { GDP_LOGIN: string },
  ): Promise<AuthLoginResponseDto> {
    const res = await this.userService.getNhnMember(
      authLoginChannelNaverDto.GDP_LOGIN,
    );

    if (!res.error_code) {
      this.logger.error('Channel Naver login failed: no error_code');
      const data: AuthLoginResponseDto = {
        authType: AuthType.ChannelNaver,
        status: StatusType.error,
      };
      return data;
    }

    const errorCode = +res.error_code;
    this.logger.debug(`Channel Naver error code: ${errorCode}`);

    switch (errorCode) {
      case NAVER_CHANNEL_ERROR_CODE.SUCCESS: {
        const user = await this.userService.authLoginChannelNaver(res.memberno);
        
        if (user === -2) {
          this.logger.warn('Channel Naver user not registered');
          const data: AuthLoginResponseDto = {
            authType: AuthType.ChannelNaver,
            status: StatusType.unregistered,
          };
          return data;
        }

        this.logger.log(`Channel Naver user logged in: ${user.user_uuid}`);

        const payload: AuthTokenPayloadDto = {
          uuid: user.user_uuid,
          cuid: user.member_cuid,
          type: user.userAuth.auth_type,
        };
        const data: AuthLoginResponseDto = {
          authType: AuthType.ChannelNaver,
          status: StatusType.success,
          access_token: this.jwtService.sign(payload),
        };
        return data;
      }

      case NAVER_CHANNEL_ERROR_CODE.UNREGISTERED: {
        this.logger.warn('Channel Naver user unregistered (code 3007)');
        const data: AuthLoginResponseDto = {
          authType: AuthType.ChannelNaver,
          status: StatusType.unregistered,
        };
        return data;
      }

      case NAVER_CHANNEL_ERROR_CODE.HMAC_EXPIRED: {
        this.logger.warn('Channel Naver HMAC expired');
        const data: AuthLoginResponseDto = {
          authType: AuthType.ChannelNaver,
          status: StatusType.fail,
        };
        return data;
      }

      default: {
        this.logger.error(`Channel Naver unknown error code: ${errorCode}`);
        const data: AuthLoginResponseDto = {
          authType: AuthType.ChannelNaver,
          status: StatusType.error,
        };
        return data;
      }
    }
  }

  /**
   * 네이버 채널링 서비스(예: NHN AppGuard)를 통해 신규 사용자를 등록하고 로그인 처리합니다.
   * @param authLoginChannelNaverRegisterDto - 채널링 서비스 사용자 등록에 필요한 정보
   * @returns 회원가입 및 로그인 처리 결과(성공, 실패 등) 및 액세스 토큰(성공 시)이 담긴 AuthLoginResponseDto
   */
  async loginChannelNaverRegister(
    authLoginChannelNaverRegisterDto: AuthLoginChannelNaverRegisterDto,
  ): Promise<AuthLoginResponseDto> {
    const user = await this.userService.authLoginChannelNaverRegister(
      authLoginChannelNaverRegisterDto,
    );

    if (user === -1) {
      this.logger.error('Channel Naver registration failed');
      const data: AuthLoginResponseDto = {
        authType: AuthType.ChannelNaver,
        status: StatusType.error,
      };
      return data;
    }

    this.logger.log(`Channel Naver user registered and logged in: ${user.user_uuid}`);

    const payload: AuthTokenPayloadDto = {
      uuid: user.user_uuid,
      cuid: user.member_cuid,
      type: user.userAuth.auth_type,
    };
    const data: AuthLoginResponseDto = {
      authType: AuthType.ChannelNaver,
      status: StatusType.success,
      access_token: this.jwtService.sign(payload),
    };

    return data;
  }
}
