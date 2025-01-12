import {
  Controller,
  Get,
  Param,
  Redirect,
  Req,
  UseGuards,
  Request,
  Post,
  Body,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Request as reqs } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { InsertLoginTokenDto } from './dto/insert-login-token.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('getip')
  get_ip(@Req() req: reqs) {
    console.log(req);
    return req.ip;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Redirect('')
  @Get('launch')
  async launchGame(@Request() req) {
    return {
      url: await this.gameService.launchGame(req),
    };
  }

  @Redirect('')
  @Get('launch/:uuid')
  async launchGameDev(@Param('uuid') uuid: string, @Req() req: reqs) {
    return {
      url: await this.gameService.launchGameDev({
        user_uuid: +uuid,
        remote_ip: req.ip,
      }),
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('info/detail')
  async getInfoDetail(@Request() guard) {
    return await this.gameService.getInfoDetail(guard.user);
  }

  @Get('info/detail/update/all')
  async infoDetailUpdateAll() {
    return await this.gameService.infoDetailUpdateAll();
  }

  @Get('info/detail/delete/all')
  async infoDetailDeleteAll() {
    return await this.gameService.infoDetailDeleteAll();
  }

  @Post('test/event')
  testEvent(@Body() data) {
    return this.gameService.testEvent(data);
  }
}
