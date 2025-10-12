/**
 * User 모듈 상수 정의
 */

// Redis 키 프리픽스
export const REDIS_KEYS = {
  GAME_CHARACTER_INFO: 'game_character_info:',
  GAME_CHARACTER_AVATAR: 'game_character_avatar:',
  NICE_API_DATA: 'nice_api_data:',
} as const;

// 캐시 만료 시간 (초)
export const CACHE_EXPIRATION = {
  AVATAR: 300, // 5분
  CHARACTER_INFO: 300, // 5분
} as const;

// 개발 환경 설정
export const DEV_CONFIG = {
  MOCK_MEMBER_UUID: 1234567890,
  MOCK_USER_ID_PREFIX: {
    SNS_NAVER: 'sns_naver_test',
    CHANNEL_NAVER: 'channel_naver_test',
  },
} as const;

// 날짜 관련 상수
export const DATE_CONFIG = {
  KOREA_TIMEZONE_OFFSET_MS: 1000 * 60 * 60 * 9, // UTC+9 (한국 시간대)
  DEFAULT_OLD_DATE: new Date('1901-01-01'),
} as const;

// NHN API 설정
export const NHN_CONFIG = {
  GAME_ID: {
    CHANNEL: 'P_PN028492',
    SNS: 'P_PN012620',
  },
  // TODO: 프로덕션에서는 실제 state 값으로 교체 필요
  DEFAULT_STATE: 'aaaaaaaaaaaa',
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  GAME: {
    ACCOUNT_CREATE: 'account/create',
    ACCOUNT_TEST: 'account/test1',
    ACCOUNT_DETAIL_LIST: 'account/detail_list/',
    ACCOUNT_DETAIL: 'account/detail/',
  },
  RENDER: {
    CHARACTER_IMAGE: 'render/character/image/',
  },
  NAVER: {
    TOKEN: 'https://nid.naver.com/oauth2.0/token',
    USER_INFO: 'https://openapi.naver.com/v1/nid/me',
  },
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  AUTH: {
    ID_DUPLICATED: 'user_create: local auth id duplicated',
    NOT_CREATED: 'user_create: auth not gen',
    TOKEN_ERROR: 'naver_auth access_token error',
    USER_DATA_ERROR: 'naver_user data error',
  },
  USER: {
    NOT_CREATED: 'user_create: user not gen',
  },
  GAME: {
    ACCOUNT_NOT_CREATED: 'user_create: game account not created',
    CHARACTER_NOT_FOUND: 'Character does not exist',
    NOT_OWNER: 'Not character owner',
  },
  AVATAR: {
    RENDER_FAILED: 'Failed to render avatar',
  },
} as const;

