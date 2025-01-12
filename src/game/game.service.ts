import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { HttpService } from '@nestjs/axios';
import {
  InsertLoginTokenDevDto,
  InsertLoginTokenDto,
} from './dto/insert-login-token.dto';
import { RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GameService {
  private readonly GAME_API_URL = this.configService.getOrThrow('GAME_API_URL');
  private readonly RENDER_API_URL =
    this.configService.getOrThrow('RENDER_API_URL');

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType,
  ) {}

  async launchGame(req: any) {
    const user = await this.userService.findOne(req.user.uuid);
    console.log(user);
    console.log(req.ip);

    const post = await this.httpService
      .post(this.GAME_API_URL + 'certificate/insert-login-token', {
        user_uuid: user.member_uuid,
        remote_ip: req.ip,
      })
      .toPromise();

    if (post.data[0] === undefined) {
      console.log(post.data.number);
      // 이미 토큰이 생성되어있음.
      if (post.data.number == 2627) {
        const re_post = await this.httpService
          .post(this.GAME_API_URL + 'certificate/get-login-token', {
            user_uuid: user.member_uuid,
          })
          .toPromise();
        return 'z9slaunchertest:' + re_post.data[0].token;
      }

      if (post.data.number == 2601) {
        const re_post = await this.httpService
          .post(this.GAME_API_URL + 'certificate/get-login-token', {
            user_uuid: user.member_uuid,
          })
          .toPromise();
        return 'z9slaunchertest:' + re_post.data[0].token;
      }
    } else {
      console.log(post.data[0]);
      return 'z9slaunchertest:' + post.data[0].token;
    }
  }

  async launchGameDev(insertLoginTokenDevDto: InsertLoginTokenDevDto) {
    const post = await this.httpService
      .post(
        this.GAME_API_URL + 'certificate/insert-login-token',
        insertLoginTokenDevDto,
      )
      .toPromise();

    if (post.data[0] === undefined) {
      console.log(post.data.number);
    } else {
      console.log(post.data[0]);
      return 'z9slaunchertest:' + post.data[0].token;
    }
  }

  //user_game_info_avatar_png
  async infoAvatarPng(uuid: string, cuid: string) {
    const avatar_url = await this.redis.hGet(
      'game_character_avatar:' + uuid,
      cuid,
    );

    if (!avatar_url) {
      return (
        '<img src="data:image/png;base64,' +
        (await this.infoAvatarUpdate(uuid, cuid)) +
        '">'
      );
    }

    return '<img src="data:image/png;base64,' + avatar_url + '">';
  }

  //user_game_info_avatar_update
  async infoAvatarUpdate(uuid: string, cuid: string) {
    let character_info = await this.redis.hGet(
      'game_character_info:' + uuid,
      cuid,
    );
    if (!character_info) {
      const detail_update = await this.infoDetailUpdate(cuid);
      if (!detail_update) {
        Logger.error('user_game_info_avatar_update: Does not exist character');
        return -1;
      }
      if (uuid != detail_update.UUID) {
        Logger.error('user_game_info_avatar_update: Not character owner');
        return -3;
      }
      character_info = detail_update;
    }

    const post = await this.httpService
      .post(this.RENDER_API_URL + 'render/character/image/', character_info)
      .toPromise()
      .catch((error) => {
        Logger.error(
          `user_game_info_avatar_update: ${error.response.data.statusCode} ${error.response.data.message}`,
          `User`,
        );
      });
    if (!post) {
      Logger.error('user_game_info_avatar_update: Dose not render avatar');
      return -2;
    }

    await this.redis.hSet(
      'game_character_avatar:' + uuid,
      cuid,
      post.data.result.toString(),
    );
    await this.redis.expire('game_character_avatar:' + uuid, 300);

    return post.data.result.toString();
  }

  //user_game_info_detail_update
  async infoDetailUpdate(cuid: string) {
    let now = Date.now();
    const get = await this.httpService
      .get(this.GAME_API_URL + 'account/detail/' + cuid)
      .toPromise()
      .catch((error) => {
        Logger.error(
          `user_game_info_detail_update: ${error.response.data.statusCode} ${error.response.data.message}`,
          `User`,
        );
      });
    if (!get) {
      return false;
    }
    Logger.log(
      `user_game_character_info_update get data latency ${Date.now() - now}ms`,
      `User`,
    );
    now = Date.now();

    await Promise.all([
      get.data.forEach((data) => {
        this.redis.hSet(
          'game_character_info:' + data.UUID,
          data.CUID,
          JSON.stringify(data),
        );
      }),
    ]);
    Logger.log(
      `user_game_character_info_update redis update latency ${
        Date.now() - now
      }ms`,
      `User`,
    );
    return get.data[0];
  }

  //user_game_info_update_all
  async infoDetailUpdateAll() {
    let now = Date.now();
    const get = await this.httpService
      .get(this.GAME_API_URL + 'account/info/update/all')
      .toPromise();
    if (!get) {
      return 0;
    }
    Logger.log(
      `infoDetailUpdateAll get data latency ${Date.now() - now}ms`,
      `Game`,
    );
    now = Date.now();

    const uuid = new Set<number>();

    await Promise.all([
      get.data.forEach((data) => {
        uuid.add(+data.UUID);
        this.redis.hSet(
          'game_character_info:' + data.UUID,
          data.CUID,
          JSON.stringify(data),
        );
      }),
    ]);
    Logger.log(
      `infoDetailUpdateAll redis update latency ${Date.now() - now}ms`,
      `Game`,
    );
    console.log(get.data.length);
    console.log(uuid.size);
  }

  //user_game_info
  async getInfoDetail(guard: { uuid: string }) {
    const user = await this.userService.findOne(guard.uuid);
    const user_info = await this.redis.hGetAll(
      'game_character_info:' + user.member_uuid,
    );

    console.log(user_info);

    const cuid_list = Object.keys(user_info);

    cuid_list.forEach((data) => {
      user_info[data] = JSON.parse(user_info[data]);
    });

    return user_info;
  }

  async infoDetailDeleteAll() {
    const now = Date.now();
    const data = await this.redis.scan(0, {
      MATCH: 'game_character_info:*',
      COUNT: 1000,
    });
    // 'redis-cli -p 7500 --scan --pattern game_character_info:* | xargs redis-cli -p 7500 unlink'
    Logger.log(
      `infoDetailDeleteAll redis latency ${Date.now() - now}ms`,
      `Game`,
    );
    console.log(data);
    return data;
  }

  async testEvent(data: any) {
    // console.log(data);
    return data;
  }
}
