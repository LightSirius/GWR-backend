import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateLocal(
    auth_id: string,
    auth_password: string,
  ): Promise<UserAuth | null> {
    const auth = await this.userService.findAuthLocalToId(auth_id);
    if (auth && (await comparePassword(auth_password, auth.auth_password))) {
      return auth.userAuth;
    }
    return null;
  }

  async login(auth: UserAuth) {
    const user: User = await this.userService.findOneToAuth(auth);
    const payload: AuthTokenPayloadDto = {
      uuid: user.user_uuid,
      cuid: user.member_cuid,
      type: user.userAuth.auth_type,
    };

    const data: AuthLoginResponseDto = {
      authType: AuthType.Local,
      status: StatusType.success,
      access_token: this.jwtService.sign(payload),
    };
    return data;
  }

  async getSnsNaverUrl() {
    return (
      'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' +
      this.configService.getOrThrow('SNS_NAVER_API_CLIENT_ID') +
      '&redirect_uri=' +
      this.configService.getOrThrow('SNS_NAVER_API_REDIRECT_URI') +
      '&state=TESTSTATE'
    );
  }

  async loginSnsNaver(authLoginSnsNaverDto: AuthLoginSnsNaverDto) {
    const user = await this.userService.authLoginSnsNaver(authLoginSnsNaverDto);
    console.log(user);
    if (user == -1) {
      const data: AuthLoginResponseDto = {
        authType: AuthType.SnsNaver,
        status: StatusType.error,
      };
      return data;
    }
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

  async getChannelNaverUrl() {
    return await this.userService.nhn_registration_url();
  }

  async loginChannelNaver(authLoginChannelNaverDto: { GDP_LOGIN: string }) {
    const res = await this.userService.nhn_get_member(
      authLoginChannelNaverDto.GDP_LOGIN,
    );
    if (!res.error_code) {
      const data: AuthLoginResponseDto = {
        authType: AuthType.ChannelNaver,
        status: StatusType.error,
      };
      return data;
    }
    switch (+res.error_code) {
      case 1000: {
        const user = await this.userService.authLoginChannelNaver(res.memberno);
        console.log(user);
        if (user == -2) {
          const data: AuthLoginResponseDto = {
            authType: AuthType.ChannelNaver,
            status: StatusType.unregistered,
          };
          return data;
        }
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
      case 3007: {
        const data: AuthLoginResponseDto = {
          authType: AuthType.ChannelNaver,
          status: StatusType.unregistered,
        };
        return data;
      }
      // # Hmac exceed time limit. (HMAC 유효 시간 초과)
      case 25: {
        const data: AuthLoginResponseDto = {
          authType: AuthType.ChannelNaver,
          status: StatusType.fail,
        };
        return data;
      }
      default: {
        const data: AuthLoginResponseDto = {
          authType: AuthType.ChannelNaver,
          status: StatusType.error,
        };
        return data;
      }
    }
  }

  async loginChannelNaverRegister(
    authLoginChannelNaverRegisterDto: AuthLoginChannelNaverRegisterDto,
  ) {
    const user = await this.userService.authLoginChannelNaverRegister(
      authLoginChannelNaverRegisterDto,
    );
    if (user == -1) {
      const data: AuthLoginResponseDto = {
        authType: AuthType.ChannelNaver,
        status: StatusType.error,
      };
      return data;
    }
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
