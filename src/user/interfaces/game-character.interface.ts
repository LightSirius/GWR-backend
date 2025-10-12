/**
 * 게임 캐릭터 관련 인터페이스 정의
 */

/**
 * 게임 캐릭터 정보
 */
export interface IGameCharacterData {
  UUID: number;
  CUID: string;
  CharacterName?: string;
  Level?: number;
  Class?: string;
  [key: string]: any; // 게임 API의 추가 필드 대응
}

/**
 * 게임 API 계정 생성 응답
 */
export interface IGameAccountCreateResponse {
  UUID: number;
  [key: string]: any;
}

/**
 * 사용자 캐릭터 정보 조회 응답
 */
export interface IUserCharacterInfo {
  user_info: Record<string, IGameCharacterData>;
  member_cuid?: string;
}

/**
 * 네이버 채널 사용자 정보
 */
export interface INaverChannelUserInfo {
  memberno: number;
  idp_custno: string;
  name: string;
  gender: string;
  birthday: string;
  email: string;
}

/**
 * 네이버 채널 토큰 응답
 */
export interface INaverChannelTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

/**
 * 네이버 SNS 사용자 정보
 */
export interface INaverSnsUserInfo {
  id: string;
  name: string;
  gender: string;
  birthyear: string;
  birthday: string;
  email: string;
  mobile: string;
}

/**
 * 네이버 SNS 토큰 응답
 */
export interface INaverSnsTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * NICE 본인인증 복호화 데이터
 */
export interface INiceDecryptedData {
  utf8_name: string;
  gender: string;
  birthdate: string;
  ci: string;
  mobileno: string;
  [key: string]: any;
}

/**
 * 렌더 API 응답
 */
export interface IRenderApiResponse {
  result: string;
  status?: string;
  [key: string]: any;
}

