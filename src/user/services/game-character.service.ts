import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { RedisClientType } from 'redis';
import { REDIS_KEYS, CACHE_EXPIRATION, API_ENDPOINTS } from '../constants/user.constants';
import { IGameCharacterData, IUserCharacterInfo } from '../interfaces/game-character.interface';

/**
 * 게임 캐릭터 정보 관리 서비스
 * 게임 API와 연동하여 캐릭터 정보를 조회하고 Redis에 캐싱합니다.
 */
@Injectable()
export class GameCharacterService {
  private readonly logger = new Logger(GameCharacterService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType,
  ) {}

  /**
   * 모든 게임 캐릭터 정보를 업데이트합니다.
   * @returns 업데이트된 캐릭터 수
   */
  async updateAllCharacterInfo(): Promise<number> {
    const startTime = Date.now();

    try {
      const response = await this.httpService
        .get(this.configService.getOrThrow('GAME_API_URL') + API_ENDPOINTS.GAME.ACCOUNT_TEST)
        .toPromise();

      if (!response || !response.data) {
        this.logger.warn('Failed to fetch character data from game API');
        return 0;
      }

      this.logger.log(
        `Character data fetched in ${Date.now() - startTime}ms`,
      );

      const updateStartTime = Date.now();
      const characterCount = response.data.length;

      // Redis 업데이트를 병렬로 처리
      const updatePromises = response.data.map((data: IGameCharacterData) =>
        this.redis.hSet(
          REDIS_KEYS.GAME_CHARACTER_INFO + data.UUID,
          data.CUID,
          JSON.stringify(data),
        ),
      );

      await Promise.all(updatePromises);

      this.logger.log(
        `${characterCount} characters updated in Redis in ${Date.now() - updateStartTime}ms`,
      );

      return characterCount;
    } catch (error) {
      this.logger.error(
        `Failed to update all character info: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 특정 사용자의 게임 캐릭터 정보를 조회합니다.
   * @param memberUuid 게임 멤버 UUID
   * @param memberCuid 선택된 캐릭터 CUID
   * @returns 캐릭터 정보 객체
   */
  async getCharacterInfo(
    memberUuid: number,
    memberCuid?: string,
  ): Promise<IUserCharacterInfo> {
    try {
      const characterInfoRaw = await this.redis.hGetAll(
        REDIS_KEYS.GAME_CHARACTER_INFO + memberUuid,
      );

      if (!characterInfoRaw || Object.keys(characterInfoRaw).length === 0) {
        this.logger.warn(`No character info found for UUID: ${memberUuid}`);
        return { user_info: {}, member_cuid: memberCuid };
      }

      // JSON 파싱
      const characterInfo = Object.keys(characterInfoRaw).reduce(
        (acc, cuid) => {
          acc[cuid] = JSON.parse(characterInfoRaw[cuid]) as IGameCharacterData;
          return acc;
        },
        {} as Record<string, IGameCharacterData>,
      );

      return { user_info: characterInfo, member_cuid: memberCuid };
    } catch (error) {
      this.logger.error(
        `Failed to get character info for UUID ${memberUuid}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 특정 사용자의 게임 캐릭터 정보를 업데이트합니다.
   * @param memberUuid 게임 멤버 UUID
   * @returns 업데이트 완료 여부
   */
  async updateUserCharacterInfo(memberUuid: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      const response = await this.httpService
        .get(
          this.configService.getOrThrow('GAME_API_URL') +
            API_ENDPOINTS.GAME.ACCOUNT_DETAIL_LIST +
            memberUuid,
        )
        .toPromise();

      if (!response || !response.data) {
        this.logger.warn(
          `Failed to fetch character data for UUID: ${memberUuid}`,
        );
        return false;
      }

      this.logger.log(
        `Character data fetched for ${memberUuid} in ${Date.now() - startTime}ms`,
      );

      const updateStartTime = Date.now();

      // Redis 업데이트를 병렬로 처리
      const updatePromises = response.data.map((data: IGameCharacterData) =>
        this.redis.hSet(
          REDIS_KEYS.GAME_CHARACTER_INFO + data.UUID,
          data.CUID,
          JSON.stringify(data),
        ),
      );

      await Promise.all(updatePromises);

      this.logger.log(
        `Character info updated for ${memberUuid} in ${Date.now() - updateStartTime}ms`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to update character info for UUID ${memberUuid}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 특정 캐릭터의 상세 정보를 조회합니다.
   * @param memberUuid 게임 멤버 UUID
   * @param cuid 캐릭터 CUID
   * @returns 캐릭터 상세 정보
   */
  async getCharacterDetail(
    memberUuid: string,
    cuid: string,
  ): Promise<IGameCharacterData | null> {
    try {
      const characterDetail = await this.redis.hGet(
        REDIS_KEYS.GAME_CHARACTER_INFO + memberUuid,
        cuid,
      );

      if (!characterDetail) {
        this.logger.warn(
          `No character detail found for UUID: ${memberUuid}, CUID: ${cuid}`,
        );
        return null;
      }

      return JSON.parse(characterDetail) as IGameCharacterData;
    } catch (error) {
      this.logger.error(
        `Failed to get character detail for UUID ${memberUuid}, CUID ${cuid}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 특정 캐릭터의 상세 정보를 업데이트합니다.
   * @param cuid 캐릭터 CUID
   * @returns 업데이트된 캐릭터 정보 또는 false
   */
  async updateCharacterDetail(cuid: string): Promise<IGameCharacterData | false> {
    const startTime = Date.now();

    try {
      const response = await this.httpService
        .get(
          this.configService.getOrThrow('GAME_API_URL') +
            API_ENDPOINTS.GAME.ACCOUNT_DETAIL +
            cuid,
        )
        .toPromise();

      if (!response || !response.data || response.data.length === 0) {
        this.logger.warn(`No character data found for CUID: ${cuid}`);
        return false;
      }

      this.logger.log(
        `Character detail fetched for ${cuid} in ${Date.now() - startTime}ms`,
      );

      const updateStartTime = Date.now();

      // Redis 업데이트
      const updatePromises = response.data.map((data: IGameCharacterData) =>
        this.redis.hSet(
          REDIS_KEYS.GAME_CHARACTER_INFO + data.UUID,
          data.CUID,
          JSON.stringify(data),
        ),
      );

      await Promise.all(updatePromises);

      this.logger.log(
        `Character detail updated for ${cuid} in ${Date.now() - updateStartTime}ms`,
      );

      return response.data[0] as IGameCharacterData;
    } catch (error) {
      this.logger.error(
        `Failed to update character detail for CUID ${cuid}: ${error.response?.data?.statusCode} ${error.response?.data?.message}`,
        error.stack,
      );
      return false;
    }
  }
}
