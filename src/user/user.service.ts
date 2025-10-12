import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthType, UserAuth } from './entities/user-auth.entity';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { encodePassword } from '../utils/bcrypt';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { UserModifyPasswordDto } from './dto/user-modify-password.dto';
import { UserModifyInfoDto } from './dto/user-modify-info.dto';
import { HttpService } from '@nestjs/axios';
import { RedisClientType } from 'redis';
import { NglAgent } from 'naver-game-lib';
import { UserAuthLocal } from './entities/user-auth-local.entity';
import {
  CreateUserResponseDto,
  Status as CreateUserStatus,
} from './dto/create-user.response.dto';
import { AuthLoginSnsNaverDto } from '../auth/dto/auth-login-sns-naver.dto';
import { ConfigService } from '@nestjs/config';
import { UserAuthSnsNaver } from './entities/user-auth-sns-naver.entity';
import { AuthLoginChannelNaverRegisterDto } from '../auth/dto/auth-login-channel-naver-register.dto';
import { UserAuthChannelNaver } from './entities/user-auth-channel-naver.entity';
import { UserRegisterLocalDto } from './dto/user-register-local.dto';
import { NiceService } from '../nice/nice.service';
import { UserModifyPhoneDto } from './dto/user-modify-phone.dto';
import {
  UserModifyPhoneResponseDto,
  Status as ModifyPhoneStatus,
} from './dto/user-modify-phone.response.dto';
import { UserModifyCuidDto } from './dto/user-modify-cuid.dto';
import { GameCharacterService } from './services/game-character.service';
import { AvatarService } from './services/avatar.service';
import {
  REDIS_KEYS,
  DATE_CONFIG,
  NHN_CONFIG,
  DEV_CONFIG,
  API_ENDPOINTS,
  ERROR_MESSAGES,
} from './constants/user.constants';
import {
  DuplicateUserIdException,
  GameAccountCreationFailedException,
  AuthCreationFailedException,
  UserCreationFailedException,
  CIMismatchException,
  ExternalAuthException,
} from './exceptions/user.exceptions';

/**
 * 사용자 관리 서비스
 * 사용자 CRUD, 인증, 회원가입, 정보 수정 등을 담당합니다.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAuth)
    private authRepository: Repository<UserAuth>,
    @InjectRepository(UserAuthLocal)
    private authLocalRepository: Repository<UserAuthLocal>,
    @InjectRepository(UserAuthSnsNaver)
    private authSnsNaverRepository: Repository<UserAuthSnsNaver>,
    @InjectRepository(UserAuthChannelNaver)
    private authChannelNaverRepository: Repository<UserAuthChannelNaver>,

    private readonly configService: ConfigService,
    private readonly entityManager: EntityManager,
    private readonly connection: Connection,
    private readonly httpService: HttpService,
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType,
    private readonly niceService: NiceService,
    private readonly gameCharacterService: GameCharacterService,
    private readonly avatarService: AvatarService,
  ) {}

  private readonly ngl = new NglAgent({
    clientID: this.configService.getOrThrow('NGL_API_CLIENT_ID'),
    clientSecretKey: this.configService.getOrThrow('NGL_API_CLIENT_SECRET'),
    gameID: NHN_CONFIG.GAME_ID.CHANNEL,
    nhnApiKey: this.configService.getOrThrow('NGL_API_CLIENT_API_KEY'),
  });

  private readonly nglSns = new NglAgent({
    clientID: this.configService.getOrThrow('SNS_NAVER_API_CLIENT_ID'),
    clientSecretKey: this.configService.getOrThrow(
      'SNS_NAVER_API_CLIENT_SECRET',
    ),
    gameID: NHN_CONFIG.GAME_ID.SNS,
    nhnApiKey: this.configService.getOrThrow('SNS_NAVER_API_CLIENT_API_KEY'),
  });

  // ============================================
  // COMMON CRUD
  // ============================================

  /**
   * UUID로 사용자 조회
   * @param userUuid - 사용자 UUID
   * @returns 사용자 엔티티
   */
  async findOne(userUuid: string): Promise<User> {
    return this.userRepository.findOneBy({ user_uuid: userUuid });
  }

  /**
   * 새로운 사용자 생성
   * @param createUserDto - 사용자 생성 DTO
   * @returns 생성 응답 (status, user_uuid)
   * @throws DuplicateUserIdException - 아이디가 중복된 경우
   * @throws GameAccountCreationFailedException - 게임 계정 생성 실패
   * @throws AuthCreationFailedException - 인증 정보 생성 실패
   * @throws UserCreationFailedException - 사용자 생성 실패
   */
  async create(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    const queryRunner = this.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const userAuth = new UserAuth({ auth_type: createUserDto.auth_type });

      switch (userAuth.auth_type) {
        case AuthType.Local: {
          createUserDto.userAuthLocal.auth_password = await encodePassword(
            createUserDto.userAuthLocal.auth_password,
          );

          const authLocal = new UserAuthLocal({
            userAuth: userAuth,
            ...createUserDto.userAuthLocal,
          });
          
          if (!(await this.authLocalDuplicateIdValidate(authLocal.auth_id))) {
            this.logger.error('user_create: local auth id duplicated. auth_id: ' + authLocal.auth_id);
            throw new DuplicateUserIdException(authLocal.auth_id);
          }

          // TODO: 프로덕션 환경에서는 실제 게임 API 연동 필요
          const isDevelopment = this.configService.get('NODE_ENV') !== 'production';
          
          if (isDevelopment) {
            this.logger.warn('Development mode: Using mock member_uuid');
            createUserDto.member_uuid = DEV_CONFIG.MOCK_MEMBER_UUID;
          } else {
            const post = await this.httpService
              .post(
                this.configService.getOrThrow('GAME_API_URL') + API_ENDPOINTS.GAME.ACCOUNT_CREATE,
                { UserID: createUserDto.userAuthLocal.auth_id },
              )
              .toPromise();
            
            if (!post?.data?.[0]?.UUID) {
              this.logger.error('Game account creation failed');
              await queryRunner.rollbackTransaction();
              throw new GameAccountCreationFailedException('Game API did not return UUID');
            }
            createUserDto.member_uuid = post.data[0].UUID;
          }

          const user = new User({
            ...createUserDto,
            userAuth,
          });

          if (!(await queryRunner.manager.save(authLocal))) {
            this.logger.error('user_create: auth local not gen');
            await queryRunner.rollbackTransaction();
            throw new AuthCreationFailedException('Local');
          }
          if (!(await queryRunner.manager.save(user))) {
            this.logger.error('user_create: user not gen');
            await queryRunner.rollbackTransaction();
            throw new UserCreationFailedException('Failed to save user entity');
          }

          await queryRunner.commitTransaction();
          return {
            status: CreateUserStatus.created,
            user_uuid: user.user_uuid,
          };
        }

        case AuthType.SnsNaver: {
          const authSnsNaver = new UserAuthSnsNaver({
            userAuth: userAuth,
            ...createUserDto.userAuthSnsNaver,
          });
          const post = await this.httpService
            .post(
              this.configService.getOrThrow('GAME_API_URL') + API_ENDPOINTS.GAME.ACCOUNT_CREATE,
              {
                UserID: DEV_CONFIG.MOCK_USER_ID_PREFIX.SNS_NAVER,
              },
            )
            .toPromise();
          if (!post.data[0].UUID) {
            Logger.error('user_create: game account not created');
            await queryRunner.rollbackTransaction();
            return { status: CreateUserStatus.acc_not_created };
          }
          createUserDto.member_uuid = post.data[0].UUID;

          const user = new User({
            ...createUserDto,
            userAuth,
          });

          if (!(await queryRunner.manager.save(authSnsNaver))) {
            Logger.error('user_create: auth sns naver not gen');
            await queryRunner.rollbackTransaction();
            return { status: CreateUserStatus.auth_not_created };
          }
          if (!(await queryRunner.manager.save(user))) {
            Logger.error('user_create: user not gen');
            await queryRunner.rollbackTransaction();
            return { status: CreateUserStatus.user_not_created };
          }

          await queryRunner.commitTransaction();
          return {
            status: CreateUserStatus.created,
            user_uuid: user.user_uuid,
          };
        }
        
        case AuthType.ChannelNaver: {
          this.logger.debug('Creating Channel Naver auth', { authData: createUserDto.userAuthChannelNaver });
          const authChannelNaver = new UserAuthChannelNaver({
            userAuth: userAuth,
            ...createUserDto.userAuthChannelNaver,
          });
          const post = await this.httpService
            .post(
              this.configService.getOrThrow('GAME_API_URL') + API_ENDPOINTS.GAME.ACCOUNT_CREATE,
              {
                UserID: DEV_CONFIG.MOCK_USER_ID_PREFIX.CHANNEL_NAVER,
              },
            )
            .toPromise();
          if (!post.data[0].UUID) {
            Logger.error('user_create: game account not created');
            await queryRunner.rollbackTransaction();
            return { status: CreateUserStatus.acc_not_created };
          }
          createUserDto.member_uuid = post.data[0].UUID;

          const user = new User({
            ...createUserDto,
            userAuth,
          });

          if (!(await queryRunner.manager.save(authChannelNaver))) {
            Logger.error('user_create: auth sns naver not gen');
            await queryRunner.rollbackTransaction();
            return { status: CreateUserStatus.auth_not_created };
          }
          if (!(await queryRunner.manager.save(user))) {
            Logger.error('user_create: user not gen');
            await queryRunner.rollbackTransaction();
            return { status: CreateUserStatus.user_not_created };
          }

          await queryRunner.commitTransaction();
          return {
            status: CreateUserStatus.created,
            user_uuid: user.user_uuid,
          };
        }
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 사용자 정보 수정
   * @param userUuid - 사용자 UUID
   * @param updateUserDto - 수정할 사용자 정보
   * @returns 수정된 사용자 엔티티
   */
  async update(userUuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ user_uuid: userUuid });
    user.user_name = updateUserDto.user_name
      ? updateUserDto.user_name
      : user.user_name;
    user.user_email = updateUserDto.user_email
      ? updateUserDto.user_email
      : user.user_email;
    user.user_born = updateUserDto.user_born
      ? updateUserDto.user_born
      : user.user_born;
    user.user_gender = updateUserDto.user_gender
      ? updateUserDto.user_gender
      : user.user_gender;
    return await this.entityManager.save(user);
  }

  /**
   * 사용자 삭제
   * @param userUuid - 사용자 UUID
   * @returns 삭제 결과
   */
  async remove(userUuid: string): Promise<DeleteResult> {
    const user = await this.findOneWithAuth(userUuid);
    return this.authRepository.delete(user.userAuth.uuid);
  }

  // ============================================
  // 인증 관련 조회 메서드
  // ============================================

  /**
   * 인증 정보로 사용자 조회
   * @param auth - 사용자 인증 엔티티
   * @returns 사용자 엔티티
   */
  async findOneToAuth(auth: UserAuth): Promise<User> {
    return this.userRepository.findOne({
      relations: { userAuth: true },
      where: { userAuth: { uuid: auth.uuid } },
    });
  }

  /**
   * 로컬 인증 ID로 인증 정보 조회
   * @param authId - 로컬 인증 ID
   * @returns 로컬 인증 엔티티
   */
  async findAuthLocalToId(authId: string): Promise<UserAuthLocal> {
    return this.authLocalRepository.findOne({
      relations: { userAuth: true },
      where: {
        auth_id: authId,
      },
    });
  }

  /**
   * 사용자의 인증 정보 조회
   * @param userUuid - 사용자 UUID
   * @returns 인증 엔티티
   */
  async findOneUserAuth(userUuid: string): Promise<UserAuth> {
    const user = await this.userRepository.findOneBy({ user_uuid: userUuid });
    return this.authRepository.findOneBy({ uuid: user.userAuth.uuid });
  }

  /**
   * 인증 정보를 포함한 사용자 조회
   * @param userUuid - 사용자 UUID
   * @returns 인증 정보가 포함된 사용자 엔티티
   */
  async findOneWithAuth(userUuid: string): Promise<User> {
    return this.userRepository.findOne({
      where: { user_uuid: userUuid },
      relations: { userAuth: true },
    });
  }

  /**
   * 로컬 인증 ID 중복 확인
   * @param authId - 확인할 인증 ID
   * @returns true: 사용 가능, false: 중복됨
   */
  async authLocalDuplicateIdValidate(authId: string): Promise<boolean> {
    const authLocal = await this.authLocalRepository.findOneBy({
      auth_id: authId,
    });
    return !authLocal;
  }

  // ============================================
  // 로컬 회원가입
  // ============================================

  /**
   * NICE 본인인증을 통한 로컬 회원가입
   * @param userRegisterLocalDto - 회원가입 정보
   * @returns 회원가입 응답
   * @throws DuplicateUserIdException - 아이디 중복
   * @throws UserCreationFailedException - 사용자 생성 실패
   */
  async userLocalRegistration(userRegisterLocalDto: UserRegisterLocalDto) {
    try {
      this.logger.log('Starting local user registration');
      const resultVal = await this.redis.get(
        REDIS_KEYS.NICE_API_DATA + encodeURI(userRegisterLocalDto.token_version_id),
      );
      const key = resultVal.slice(0, 16);
      const iv = resultVal.slice(-16);

      const decryptUserData = this.niceService.decrypt(
        userRegisterLocalDto.enc_data,
        key,
        iv,
      );

      const createDto: CreateUserDto = {
        auth_type: AuthType.Local,
        user_name: decodeURI(decryptUserData.utf8_name),
        user_gender: Boolean(+decryptUserData.gender),
        user_born: new Date(
          decryptUserData.birthdate.substring(0, 4),
          decryptUserData.birthdate.substring(4, 6),
          decryptUserData.birthdate.substring(6, 8),
        ),
        user_email: userRegisterLocalDto.user_email,
        user_ci: decryptUserData.ci,
        phone_number: decryptUserData.mobileno,
        phone_sns_agree: userRegisterLocalDto.phone_sns_agree,
        phone_sns_agree_date: userRegisterLocalDto.phone_sns_agree
          ? new Date(Date.now() + DATE_CONFIG.KOREA_TIMEZONE_OFFSET_MS)
          : DATE_CONFIG.DEFAULT_OLD_DATE,
        member_uuid: null,
        userAuthLocal: {
          auth_id: userRegisterLocalDto.auth_id,
          auth_password: userRegisterLocalDto.auth_password,
        },
      };
      this.logger.debug('User creation DTO prepared', { userId: createDto.userAuthLocal.auth_id });
      const createResponse = await this.create(createDto);
      this.logger.log('User creation response', { status: createResponse.status });

      await this.redis.del(
        REDIS_KEYS.NICE_API_DATA + encodeURI(userRegisterLocalDto.token_version_id),
      );

      return createResponse;
    } catch (err) {
      throw err;
    }
  }

  /**
   * 간단한 사용자 등록 (테스트용)
   * @param userRegistrationDto - 회원가입 정보
   * @returns 회원가입 응답
   */
  async userRegistration(userRegistrationDto: UserRegistrationDto) {
    return await this.create({
      member_uuid: null,
      userAuthLocal: {
        auth_id: userRegistrationDto.auth_id,
        auth_password: userRegistrationDto.auth_password,
      },
      ...userRegistrationDto,
    });
  }

  // ============================================
  // 네이버 채널 로그인/가입
  // ============================================

  /**
   * 네이버 채널을 통한 회원가입
   * @param authLoginChannelNaverRegisterDto - 네이버 채널 인증 정보
   * @returns 생성된 사용자 또는 -1 (실패)
   * @throws ExternalAuthException - 외부 인증 실패
   */
  async authLoginChannelNaverRegister(
    authLoginChannelNaverRegisterDto: AuthLoginChannelNaverRegisterDto,
  ) {
    try {
      const token = await this.ngl.getAccessToken(
        authLoginChannelNaverRegisterDto.code,
        authLoginChannelNaverRegisterDto.state,
      );
      this.logger.debug('Channel Naver token received');
      const userInfo = await this.ngl.getUserInfo(token.data.access_token);
      this.logger.debug('Channel Naver user info received', { memberNo: userInfo.data.memberno });

      const createDto: CreateUserDto = {
        auth_type: AuthType.ChannelNaver,
        user_name: userInfo.data.name,
        user_gender: userInfo.data.gender == 'M',
        user_born: new Date(
          userInfo.data.birthday.substring(0, 4),
          userInfo.data.birthday.substring(4, 6),
          userInfo.data.birthday.substring(6, 8),
        ),
        user_email: userInfo.data.email,
        user_ci: null,
        phone_number: null,
        phone_sns_agree: false,
        phone_sns_agree_date: null,
        member_uuid: null,
        userAuthChannelNaver: {
          channel_memberno: userInfo.data.memberno,
          channel_ipd_custno: userInfo.data.idp_custno,
          channel_access_token: token.data.access_token,
          channel_refresh_token: token.data.refresh_token,
        },
      };

      const createResponse = await this.create(createDto);
      this.logger.log('Channel Naver user creation completed', { status: createResponse.status });

      if (createResponse.status == CreateUserStatus.created) {
        return await this.userRepository.findOne({
          relations: { userAuth: true },
          where: {
            user_uuid: createResponse.user_uuid,
          },
        });
      }

      return -1;
    } catch (err) {
      throw err;
    }
  }

  /**
   * 네이버 채널 로그인
   * @param memberno - 네이버 채널 회원 번호
   * @returns 사용자 엔티티 또는 -2 (미가입)
   */
  async authLoginChannelNaver(memberno: number) {
    const authChannelNaver = await this.authChannelNaverRepository.findOne({
      relations: { userAuth: true },
      where: {
        channel_memberno: memberno,
      },
    });
    if (!authChannelNaver) {
      return -2;
    }
    const user = await this.userRepository.findOne({
      relations: { userAuth: true },
      where: {
        userAuth: { uuid: authChannelNaver.userAuth.uuid },
      },
    });
    return user;
  }

  // ============================================
  // 네이버 SNS 로그인/가입
  // ============================================

  /**
   * 네이버 SNS 로그인 또는 회원가입
   * @param authLoginSnsNaverDto - 네이버 SNS 인증 정보
   * @returns 사용자 엔티티 또는 -1 (실패)
   * @throws ExternalAuthException - 외부 인증 실패
   */
  async authLoginSnsNaver(authLoginSnsNaverDto: AuthLoginSnsNaverDto) {
    try {
      const getNaverAuth = await this.httpService
        .get(
          'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=' +
            this.configService.getOrThrow('SNS_NAVER_API_CLIENT_ID') +
            '&client_secret=' +
            this.configService.getOrThrow('SNS_NAVER_API_CLIENT_SECRET') +
            '&code=' +
            authLoginSnsNaverDto.code +
            '&state=' +
            authLoginSnsNaverDto.code,
        )
        .toPromise();
      if (!getNaverAuth.data.access_token) {
        this.logger.error('authLoginSnsNaver: naver_auth access_token error');
        return -1;
      }
      this.logger.debug('SNS Naver auth token received');

      const authToken = `Bearer ${getNaverAuth.data.access_token}`;

      const getNaverUser = await this.httpService
        .get('https://openapi.naver.com/v1/nid/me', {
          headers: { Authorization: authToken },
        })
        .toPromise();
      if (!getNaverUser.data.response.id) {
        this.logger.error('authLoginSnsNaver: naver_user data error');
        return -1;
      }
      this.logger.debug('SNS Naver user data received', { userId: getNaverUser.data.response.id });

      const authSnsNaver = await this.authSnsNaverRepository.findOne({
        relations: { userAuth: true },
        where: {
          sns_id: getNaverUser.data.response.id,
        },
      });

      if (authSnsNaver) {
        authSnsNaver.sns_access_token = getNaverAuth.data.access_token;
        authSnsNaver.sns_refresh_token = getNaverAuth.data.refresh_token;
        authSnsNaver.sns_access_token_expires = new Date(
          new Date().getTime() + getNaverAuth.data.expires_in * 1000,
        );
        await this.authSnsNaverRepository.save(authSnsNaver);

        const user = await this.userRepository.findOne({
          relations: { userAuth: true },
          where: {
            userAuth: { uuid: authSnsNaver.userAuth.uuid },
          },
        });

        return user;
      } else {
        const createDto: CreateUserDto = {
          auth_type: AuthType.SnsNaver,
          user_name: getNaverUser.data.response.name,
          user_gender: getNaverUser.data.response.gender == 'M',
          user_born: new Date(
            getNaverUser.data.response.birthyear +
              '-' +
              getNaverUser.data.response.birthday,
          ),
          user_email: getNaverUser.data.response.email,
          user_ci: null,
          phone_number: getNaverUser.data.response.mobile,
          phone_sns_agree: false,
          phone_sns_agree_date: null,
          member_uuid: null,
          userAuthSnsNaver: {
            sns_id: getNaverUser.data.response.id,
            sns_access_token: getNaverAuth.data.access_token,
            sns_refresh_token: getNaverAuth.data.refresh_token,
            sns_access_token_expires: new Date(
              new Date().getTime() + getNaverAuth.data.expires_in * 1000,
            ),
          },
        };
        const createResponse = await this.create(createDto);
        if (createResponse.status == CreateUserStatus.created) {
          return await this.userRepository.findOne({
            relations: { userAuth: true },
            where: {
              user_uuid: createResponse.user_uuid,
            },
          });
        }
        return -1;
      }
    } catch (err) {
      throw err;
    }
  }

  // ============================================
  // 사용자 정보 수정
  // ============================================

  /**
   * 사용자 전화번호 수정 (NICE 본인인증)
   * @param userModifyPhoneDto - 전화번호 수정 정보
   * @param guard - 인증된 사용자 정보
   * @returns 수정 결과
   * @throws CIMismatchException - CI 불일치
   */
  async userModifyPhone(
    userModifyPhoneDto: UserModifyPhoneDto,
    guard: { uuid: string },
  ): Promise<UserModifyPhoneResponseDto> {
    try {
      this.logger.debug('Phone modification request received');
      const resultVal = await this.redis.get(
        REDIS_KEYS.NICE_API_DATA + encodeURI(userModifyPhoneDto.token_version_id),
      );
      const key = resultVal.slice(0, 16);
      const iv = resultVal.slice(-16);

      const decryptUserData = this.niceService.decrypt(
        userModifyPhoneDto.enc_data,
        key,
        iv,
      );
      this.logger.debug('User data decrypted for phone modification');

      const user = await this.findOne(guard.uuid);
      if (user.user_ci != decryptUserData.ci) {
        this.logger.warn('CI mismatch during phone modification', { userId: guard.uuid });
        throw new CIMismatchException();
      }
      user.phone_number = decryptUserData.mobileno;

      await this.entityManager.save(user);

      return { status: ModifyPhoneStatus.success };
    } catch (err) {
      throw err;
    }
  }

  /**
   * 사용자 기본 정보 수정 (이메일, 생년월일)
   * @param userModifyInfoDto - 수정할 정보
   * @param guard - 인증된 사용자 정보
   * @returns 수정된 사용자 엔티티
   */
  async userModifyInfo(
    userModifyInfoDto: UserModifyInfoDto,
    guard: { uuid: string },
  ) {
    const user = await this.userRepository.findOneBy({ user_uuid: guard.uuid });
    user.user_email = userModifyInfoDto.user_email
      ? userModifyInfoDto.user_email
      : user.user_email;
    user.user_born = userModifyInfoDto.user_born
      ? userModifyInfoDto.user_born
      : user.user_born;

    return await this.entityManager.save(user);
  }

  /**
   * 로컬 계정 비밀번호 변경
   * @param userModifyPasswordDto - 새 비밀번호
   * @param guard - 인증된 사용자 정보
   * @param auth - 인증 엔티티
   * @returns 수정된 인증 엔티티
   */
  async authLocalModifyPassword(
    userModifyPasswordDto: UserModifyPasswordDto,
    guard: { uuid: string },
    auth: UserAuth,
  ) {
    const authLocal = await this.authLocalRepository.findOneBy({
      userAuth: auth,
    });

    authLocal.auth_password = await encodePassword(
      userModifyPasswordDto.auth_password,
    );

    return await this.entityManager.save(authLocal);
  }

  /**
   * 사용자 비밀번호 변경
   * @param userModifyPasswordDto - 새 비밀번호
   * @param guard - 인증된 사용자 정보
   * @returns 수정된 인증 엔티티 또는 null
   */
  async userModifyPassword(
    userModifyPasswordDto: UserModifyPasswordDto,
    guard: { uuid: string },
  ) {
    const auth = await this.findOneUserAuth(guard.uuid);

    switch (auth.auth_type) {
      case AuthType.Local: {
        return await this.authLocalModifyPassword(
          userModifyPasswordDto,
          guard,
          auth,
        );
      }
      case AuthType.ChannelNaver:
      case AuthType.SnsNaver: {
        this.logger.warn('Password modification not supported for SNS accounts');
        return null;
      }
      default: {
        this.logger.error('Unknown auth type', { authType: auth.auth_type });
        return null;
      }
    }
  }

  /**
   * 대표 캐릭터 CUID 설정
   * @param userModifyCuidDto - 캐릭터 CUID
   * @param guard - 인증된 사용자 정보
   * @returns 수정된 사용자 엔티티
   */
  async userModifyCuid(
    userModifyCuidDto: UserModifyCuidDto,
    guard: { uuid: string },
  ) {
    const user = await this.findOne(guard.uuid);
    user.member_cuid = userModifyCuidDto.cuid;
    return await this.entityManager.save(user);
  }

  // ============================================
  // 게임 캐릭터 정보 관리 (위임)
  // ============================================

  /**
   * 모든 게임 캐릭터 정보 업데이트
   * @returns 업데이트된 캐릭터 수
   */
  async updateAllGameInfo(): Promise<number> {
    return await this.gameCharacterService.updateAllCharacterInfo();
  }

  /**
   * 사용자의 게임 캐릭터 정보 조회
   * @param guard - 인증된 사용자 정보
   * @returns 캐릭터 정보
   */
  async getGameInfo(guard: { uuid: string }) {
    const user = await this.findOne(guard.uuid);
    return await this.gameCharacterService.getCharacterInfo(
      Number(user.member_uuid),
      user.member_cuid ? String(user.member_cuid) : undefined,
    );
  }

  /**
   * 특정 사용자의 게임 캐릭터 정보 자체 업데이트
   * @param uuid - 게임 멤버 UUID
   * @returns 업데이트 성공 여부
   */
  async updateSelfGameInfo(uuid: string): Promise<boolean> {
    const updateSuccess = await this.gameCharacterService.updateUserCharacterInfo(uuid);
    
    if (!updateSuccess) {
      return false;
    }

    // 캐릭터 정보 조회 후 아바타 일괄 업데이트
    const characterInfo = await this.gameCharacterService.getCharacterInfo(
      Number(uuid),
    );

    if (!characterInfo.user_info) {
      return true;
    }

    // 모든 캐릭터의 아바타를 병렬로 업데이트
    const avatarUpdatePromises = Object.entries(characterInfo.user_info).map(
      ([cuid, info]) =>
        this.avatarService.updateAvatarBatch(uuid, cuid, JSON.stringify(info)),
    );

    await Promise.all(avatarUpdatePromises);
    this.logger.log(`Avatar batch update completed for UUID: ${uuid}`);

    return true;
  }

  /**
   * 특정 캐릭터 상세 정보 조회
   * @param uuid - 게임 멤버 UUID
   * @param cuid - 캐릭터 CUID
   * @returns 캐릭터 상세 정보
   */
  async getGameInfoDetail(uuid: string, cuid: string) {
    return await this.gameCharacterService.getCharacterDetail(uuid, cuid);
  }

  /**
   * 특정 캐릭터 정보 강제 업데이트
   * @param cuid - 캐릭터 CUID
   * @returns 업데이트된 캐릭터 정보
   */
  async updateGameInfoDetail(cuid: string) {
    return await this.gameCharacterService.updateCharacterDetail(cuid);
  }

  // ============================================
  // 게임 아바타 관리 (위임)
  // ============================================

  /**
   * 특정 사용자의 모든 아바타 조회
   * @param uuid - 게임 멤버 UUID
   * @returns 아바타 URL 맵
   */
  async getAllGameAvatars(uuid: string) {
    return await this.avatarService.getAllAvatars(uuid);
  }

  /**
   * 특정 캐릭터의 아바타 조회
   * @param uuid - 게임 멤버 UUID
   * @param cuid - 캐릭터 CUID
   * @returns base64 아바타 이미지
   */
  async getGameAvatar(uuid: string, cuid: string) {
    return await this.avatarService.getAvatar(uuid, cuid);
  }

  /**
   * 특정 캐릭터의 아바타를 PNG HTML로 조회
   * @param uuid - 게임 멤버 UUID
   * @param cuid - 캐릭터 CUID
   * @returns HTML img 태그
   */
  async getGameAvatarPng(uuid: string, cuid: string) {
    return await this.avatarService.getAvatarAsHtml(uuid, cuid);
  }

  // ============================================
  // NHN API 관련 (개발/테스트용)
  // TODO: 테스트 전용 컨트롤러로 이동 필요
  // ============================================

  /**
   * NHN 회원가입 URL 생성
   * @returns 회원가입 URL
   */
  async getNhnRegistrationUrl(): Promise<string> {
    return this.ngl.getAuthCodeUrl(
      this.configService.getOrThrow('DEV_NAVER_URL') + 'naver/getAccessToken',
      NHN_CONFIG.DEFAULT_STATE,
    );
  }

  /**
   * NHN 사용자 정보 조회 (테스트용)
   * @param token - 액세스 토큰
   * @returns 사용자 정보
   */
  async getNhnUser(token: string) {
    const res = await this.ngl.getUserInfo(token);
    return res.data;
  }

  /**
   * NHN 멤버 상태 조회 (테스트용)
   * @param login - 로그인 ID
   * @returns 멤버 상태
   */
  async getNhnMember(login: string) {
    const res = await this.ngl.getMemberStatus(login);
    return res.data;
  }
}
