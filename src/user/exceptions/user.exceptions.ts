import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 사용자 관련 커스텀 예외 클래스들
 */

/**
 * 사용자를 찾을 수 없을 때 발생하는 예외
 */
export class UserNotFoundException extends HttpException {
  constructor(userId?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: 'UserNotFound',
        userId,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * 중복된 사용자 ID가 발견되었을 때 발생하는 예외
 */
export class DuplicateUserIdException extends HttpException {
  constructor(authId: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: 'User ID already exists',
        error: 'DuplicateUserId',
        authId,
      },
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * 게임 계정 생성에 실패했을 때 발생하는 예외
 */
export class GameAccountCreationFailedException extends HttpException {
  constructor(reason?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Failed to create game account',
        error: 'GameAccountCreationFailed',
        reason,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

/**
 * 캐릭터를 찾을 수 없을 때 발생하는 예외
 */
export class CharacterNotFoundException extends HttpException {
  constructor(cuid?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Character not found',
        error: 'CharacterNotFound',
        cuid,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * 캐릭터 소유자가 아닐 때 발생하는 예외
 */
export class NotCharacterOwnerException extends HttpException {
  constructor(memberUuid: string, cuid: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You are not the owner of this character',
        error: 'NotCharacterOwner',
        memberUuid,
        cuid,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * 아바타 렌더링에 실패했을 때 발생하는 예외
 */
export class AvatarRenderFailedException extends HttpException {
  constructor(reason?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Failed to render avatar',
        error: 'AvatarRenderFailed',
        reason,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

/**
 * 외부 인증 서비스 (네이버 등)에서 오류가 발생했을 때
 */
export class ExternalAuthException extends HttpException {
  constructor(service: string, reason?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_GATEWAY,
        message: `External authentication service error: ${service}`,
        error: 'ExternalAuthError',
        service,
        reason,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

/**
 * CI(연계정보) 불일치 시 발생하는 예외
 */
export class CIMismatchException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'CI information does not match',
        error: 'CIMismatch',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * 인증 생성에 실패했을 때 발생하는 예외
 */
export class AuthCreationFailedException extends HttpException {
  constructor(authType: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create authentication',
        error: 'AuthCreationFailed',
        authType,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * 사용자 생성에 실패했을 때 발생하는 예외
 */
export class UserCreationFailedException extends HttpException {
  constructor(reason?: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create user',
        error: 'UserCreationFailed',
        reason,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

