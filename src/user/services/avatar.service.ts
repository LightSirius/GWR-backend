import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { RedisClientType } from 'redis';
import { GameCharacterService } from './game-character.service';
import { REDIS_KEYS, CACHE_EXPIRATION, API_ENDPOINTS, ERROR_MESSAGES } from '../constants/user.constants';
import { IRenderApiResponse } from '../interfaces/game-character.interface';

/**
 * 게임 캐릭터 아바타 렌더링 서비스
 * 캐릭터 정보를 기반으로 아바타 이미지를 생성하고 캐싱합니다.
 */
@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly gameCharacterService: GameCharacterService,
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType,
  ) {}

  /**
   * 특정 사용자의 모든 캐릭터 아바타를 조회합니다.
   * @param memberUuid 게임 멤버 UUID
   * @returns 아바타 URL 맵 (CUID -> base64 이미지)
   */
  async getAllAvatars(memberUuid: string): Promise<Record<string, string>> {
    try {
      const avatarUrls = await this.redis.hGetAll(
        REDIS_KEYS.GAME_CHARACTER_AVATAR + memberUuid,
      );

      if (!avatarUrls || Object.keys(avatarUrls).length === 0) {
        this.logger.debug(`No avatars found for UUID: ${memberUuid}`);
        return {};
      }

      return avatarUrls;
    } catch (error) {
      this.logger.error(
        `Failed to get all avatars for UUID ${memberUuid}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 특정 캐릭터의 아바타를 조회합니다. 없으면 생성합니다.
   * @param memberUuid 게임 멤버 UUID
   * @param cuid 캐릭터 CUID
   * @returns base64 인코딩된 아바타 이미지
   */
  async getAvatar(memberUuid: string, cuid: string): Promise<string | number> {
    try {
      const cachedAvatar = await this.redis.hGet(
        REDIS_KEYS.GAME_CHARACTER_AVATAR + memberUuid,
        cuid,
      );

      if (cachedAvatar) {
        this.logger.debug(`Avatar cache hit for UUID: ${memberUuid}, CUID: ${cuid}`);
        return cachedAvatar;
      }

      // 캐시에 없으면 새로 생성
      this.logger.debug(`Avatar cache miss for UUID: ${memberUuid}, CUID: ${cuid}. Generating...`);
      return await this.updateAvatar(memberUuid, cuid);
    } catch (error) {
      this.logger.error(
        `Failed to get avatar for UUID ${memberUuid}, CUID ${cuid}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 특정 캐릭터의 아바타를 업데이트(재생성)합니다.
   * @param memberUuid 게임 멤버 UUID
   * @param cuid 캐릭터 CUID
   * @returns base64 인코딩된 아바타 이미지 또는 에러 코드
   */
  async updateAvatar(memberUuid: string, cuid: string): Promise<string | number> {
    try {
      // 캐릭터 정보 조회
      let characterInfo = await this.redis.hGet(
        REDIS_KEYS.GAME_CHARACTER_INFO + memberUuid,
        cuid,
      );

      // 캐릭터 정보가 없으면 API에서 조회
      if (!characterInfo) {
        this.logger.debug(`Character info not found in cache. Fetching from API...`);
        const detailUpdate = await this.gameCharacterService.updateCharacterDetail(cuid);
        
        if (!detailUpdate) {
          this.logger.error(ERROR_MESSAGES.GAME.CHARACTER_NOT_FOUND + `: ${cuid}`);
          return -1; // 캐릭터가 존재하지 않음
        }

        if (memberUuid !== detailUpdate.UUID.toString()) {
          this.logger.error(
            `${ERROR_MESSAGES.GAME.NOT_OWNER}. Expected: ${memberUuid}, Got: ${detailUpdate.UUID}`,
          );
          return -3; // 캐릭터 소유자가 아님
        }

        characterInfo = JSON.stringify(detailUpdate);
      }

      // 아바타 렌더링 요청
      const renderResponse = await this.renderAvatar(characterInfo);
      
      if (!renderResponse) {
        return -2; // 렌더링 실패
      }

      // Redis에 캐싱
      await this.redis.hSet(
        REDIS_KEYS.GAME_CHARACTER_AVATAR + memberUuid,
        cuid,
        renderResponse,
      );
      await this.redis.expire(
        REDIS_KEYS.GAME_CHARACTER_AVATAR + memberUuid,
        CACHE_EXPIRATION.AVATAR,
      );

      this.logger.log(`Avatar updated successfully for UUID: ${memberUuid}, CUID: ${cuid}`);
      return renderResponse;
    } catch (error) {
      this.logger.error(
        `Failed to update avatar for UUID ${memberUuid}, CUID ${cuid}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 캐릭터 정보를 사용하여 여러 아바타를 일괄 업데이트합니다.
   * @param memberUuid 게임 멤버 UUID
   * @param cuid 캐릭터 CUID
   * @param characterInfo 캐릭터 정보 (JSON 문자열)
   */
  async updateAvatarBatch(
    memberUuid: string,
    cuid: string,
    characterInfo: string,
  ): Promise<void> {
    try {
      const renderResponse = await this.renderAvatar(characterInfo);

      if (!renderResponse) {
        this.logger.warn(`Failed to render avatar for CUID: ${cuid}`);
        return;
      }

      await this.redis.hSet(
        REDIS_KEYS.GAME_CHARACTER_AVATAR + memberUuid,
        cuid,
        renderResponse,
      );
      await this.redis.expire(
        REDIS_KEYS.GAME_CHARACTER_AVATAR + memberUuid,
        CACHE_EXPIRATION.AVATAR,
      );

      this.logger.debug(`Avatar batch updated for CUID: ${cuid}`);
    } catch (error) {
      this.logger.error(
        `Failed to batch update avatar for UUID ${memberUuid}, CUID ${cuid}: ${error.message}`,
        error.stack,
      );
      // 개별 아바타 업데이트 실패는 전체 프로세스를 중단하지 않음
    }
  }

  /**
   * 아바타를 PNG 이미지 태그로 반환합니다.
   * @param memberUuid 게임 멤버 UUID
   * @param cuid 캐릭터 CUID
   * @returns HTML img 태그
   */
  async getAvatarAsHtml(memberUuid: string, cuid: string): Promise<string> {
    const avatarData = await this.getAvatar(memberUuid, cuid);

    if (typeof avatarData === 'number') {
      // 에러 코드인 경우
      return `<img src="" alt="Avatar generation failed (error code: ${avatarData})">`;
    }

    return `<img src="data:image/png;base64,${avatarData}" alt="Character Avatar">`;
  }

  /**
   * 렌더링 API를 호출하여 아바타 이미지를 생성합니다.
   * @param characterInfo 캐릭터 정보 (JSON 문자열 또는 객체)
   * @returns base64 인코딩된 이미지 또는 null
   */
  private async renderAvatar(characterInfo: string | Record<string, unknown>): Promise<string | null> {
    try {
      const response = await this.httpService
        .post<IRenderApiResponse>(
          this.configService.getOrThrow('RENDER_API_URL') +
            API_ENDPOINTS.RENDER.CHARACTER_IMAGE,
          characterInfo,
        )
        .toPromise();

      if (!response || !response.data || !response.data.result) {
        this.logger.error(ERROR_MESSAGES.AVATAR.RENDER_FAILED + ': No result data');
        return null;
      }

      return response.data.result.toString();
    } catch (error) {
      this.logger.error(
        `${ERROR_MESSAGES.AVATAR.RENDER_FAILED}: ${error.response?.data?.statusCode} ${error.response?.data?.message}`,
        error.stack,
      );
      return null;
    }
  }
}
