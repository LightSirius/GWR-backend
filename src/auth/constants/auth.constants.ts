/**
 * Auth 모듈 상수 정의
 */

/**
 * 네이버 OAuth 관련 상수
 */
export const NAVER_OAUTH = {
  // 네이버 OAuth 토큰 발급 URL
  TOKEN_URL: 'https://nid.naver.com/oauth2.0/token',
  // 네이버 OAuth 인증 URL
  AUTHORIZE_URL: 'https://nid.naver.com/oauth2.0/authorize',
  // 네이버 사용자 정보 조회 URL
  USER_INFO_URL: 'https://openapi.naver.com/v1/nid/me',
} as const;

/**
 * JWT 토큰 관련 상수
 */
export const JWT_CONFIG = {
  // 토큰 만료 시간 (분)
  EXPIRES_IN: '60m',
} as const;

/**
 * OAuth 상태 값 (CSRF 방지용)
 * TODO: 프로덕션에서는 랜덤 생성 또는 세션 기반으로 변경 필요
 */
export const OAUTH_STATE = {
  DEFAULT: 'TESTSTATE',
} as const;

/**
 * 네이버 채널 에러 코드
 */
export const NAVER_CHANNEL_ERROR_CODE = {
  SUCCESS: 1000, // 정상
  UNREGISTERED: 3007, // 미등록 사용자
  HMAC_EXPIRED: 25, // HMAC 유효 시간 초과
} as const;

/**
 * 인증 관련 에러 메시지
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  TOKEN_EXPIRED: '토큰이 만료되었습니다.',
  INVALID_TOKEN: '유효하지 않은 토큰입니다.',
  EXTERNAL_AUTH_FAILED: '외부 인증 서비스 오류가 발생했습니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
} as const;

