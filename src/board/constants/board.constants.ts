/**
 * Board 모듈 상수 정의
 */

/**
 * Elasticsearch 인덱스 이름 매핑
 */
export const BOARD_INDEX = {
  FREE: 'board_free',
  UCC: 'board_ucc',
  TIPS: 'board_tips',
  COMMUNITY: 'board_community',
} as const;

/**
 * Redis 키 프리픽스
 */
export const BOARD_REDIS_KEYS = {
  DETAIL_LIST: 'board_detail_list',
} as const;

/**
 * 검색 기본 설정
 */
export const BOARD_SEARCH_CONFIG = {
  DEFAULT_SIZE: 20,
  DEFAULT_PAGE: 0,
} as const;

/**
 * Elasticsearch Agent API URL
 * TODO: 환경 변수로 이동 필요
 */
export const ELASTICSEARCH_AGENT_URL = 'http://host.docker.internal:3100';

/**
 * 게시글 관련 메시지
 */
export const BOARD_MESSAGES = {
  DELETED_TITLE: '삭제된 게시글입니다.',
  BLOCKED_TITLE: '차단된 게시글입니다.',
} as const;

/**
 * 게시글 에러 메시지
 */
export const BOARD_ERROR_MESSAGES = {
  NOT_FOUND: '게시글을 찾을 수 없습니다.',
  NOT_OWNER: '게시글 작성자만 수정/삭제할 수 있습니다.',
  ES_UPDATE_FAILED: 'Elasticsearch 업데이트에 실패했습니다.',
  VIEW_COUNT_UPDATE_FAILED: '조회수 업데이트에 실패했습니다.',
  INVALID_SEARCH_PARAMS: '잘못된 검색 파라미터입니다.',
} as const;

