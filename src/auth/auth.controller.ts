import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  Redirect,
} from '@nestjs/common';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthLoginLocalDto } from './dto/auth-login-local.dto';
import { AuthLoginSnsNaverDto } from './dto/auth-login-sns-naver.dto';
import { AuthLoginChannelNaverRegisterDto } from './dto/auth-login-channel-naver-register.dto';

@ApiTags('Auth API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('login')
  async loginJwt(@Request() req) {
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  async loginLocal(
    @Request() req,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginAuthDto: AuthLoginLocalDto,
  ) {
    return this.authService.login(req.user);
  }

  @Post('login/sns/naver')
  async loginSnsNaver(
    @Body() authLoginSnsNaverDto: AuthLoginSnsNaverDto,
  ): Promise<any> {
    return this.authService.loginSnsNaver(authLoginSnsNaverDto);
  }

  @Redirect('')
  @Get('login/sns/naver/url')
  async loginSnsNaverUrl() {
    return {
      url: await this.authService.getSnsNaverUrl(),
    };
  }

  @Post('login/channel/naver')
  async loginChannelNaver(
    @Body() authLoginChannelNaverDto: { GDP_LOGIN: string },
  ) {
    return this.authService.loginChannelNaver(authLoginChannelNaverDto);
  }

  @Redirect('')
  @Get('login/channel/naver/url')
  async loginChannelNaverUrl() {
    return {
      url: await this.authService.getChannelNaverUrl(),
    };
  }

  @Post('login/channel/naver/register')
  async loginChannelNaverRegister(
    @Body() authLoginChannelNaverRegisterDto: AuthLoginChannelNaverRegisterDto,
  ): Promise<any> {
    return this.authService.loginChannelNaverRegister(
      authLoginChannelNaverRegisterDto,
    );
  }
}
