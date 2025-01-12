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
import * as fs from 'fs';
import * as path from 'path';
import * as Papa from 'papaparse';
import * as crypto from 'crypto';
import { NglAgent } from 'naver-game-lib';
import { AxiosResponse } from 'axios';
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
import { UserMg } from './entities/user-mg.entity';
import { createRandomString } from '../utils/utill';
import { UserRegisterLocalDto } from './dto/user-register-local.dto';
import { NiceService } from '../nice/nice.service';
import { UserModifyPhoneDto } from './dto/user-modify-phone.dto';
import {
  UserModifyPhoneResponseDto,
  Status as ModifyPhoneStatus,
} from './dto/user-modify-phone.response.dto';
import { UserModifyCuidDto } from './dto/user-modify-cuid.dto';

class t_members {
  PhoneNumber: string;
  NickName: string;
  smsconfirm: boolean;
  ldate: Date;
  E_Mail: string;
  name: string;
  bday: number;
  gender: boolean;
  DupInfo: string;
  ID: string;
  pwd: string;
  UUID: number;
}

@Injectable()
export class UserService {
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
  ) {}

  private readonly ngl = new NglAgent({
    clientID: this.configService.getOrThrow('NGL_API_CLIENT_ID'),
    clientSecretKey: this.configService.getOrThrow('NGL_API_CLIENT_SECRET'),
    gameID: 'P_PN028492',
    nhnApiKey: this.configService.getOrThrow('NGL_API_CLIENT_API_KEY'),
  });

  private readonly ngl_sns = new NglAgent({
    clientID: this.configService.getOrThrow('SNS_NAVER_API_CLIENT_ID'),
    clientSecretKey: this.configService.getOrThrow(
      'SNS_NAVER_API_CLIENT_SECRET',
    ),
    gameID: 'P_PN012620',
    nhnApiKey: this.configService.getOrThrow('SNS_NAVER_API_CLIENT_API_KEY'),
  });

  async userModifyPhone(
    userModifyPhoneDto: UserModifyPhoneDto,
    guard: { uuid: string },
  ): Promise<UserModifyPhoneResponseDto> {
    try {
      console.log(userModifyPhoneDto);
      const resultVal = await this.redis.get(
        'nice_api_data:' + encodeURI(userModifyPhoneDto.token_version_id),
      );
      const key = resultVal.slice(0, 16);
      const iv = resultVal.slice(-16);

      const decryptUserData = this.niceService.decrypt(
        userModifyPhoneDto.enc_data,
        key,
        iv,
      );
      console.log(decryptUserData);

      const user = await this.findOne(guard.uuid);
      if (user.user_ci != decryptUserData.ci) {
        return { status: ModifyPhoneStatus.notsameCI };
      }
      user.phone_number = decryptUserData.mobileno;

      await this.entityManager.save(user);

      return { status: ModifyPhoneStatus.success };
    } catch (err) {
      throw err;
    }
  }

  async user_nice_test_result(body: any) {
    const resultVal = await this.redis.get(
      'nice_api_data:' + body.token_verstion_id,
    );

    const re_key = resultVal.slice(0, 16);
    const re_iv = resultVal.slice(-16);

    // 주어진 암호화된 데이터와 키, IV
    const base64Enc: string = body.enc_data; // 암호화된 데이터 입력
    const key: string = re_key; // 키 입력
    const iv: string = re_iv; // IV 입력

    // Base64 디코딩 및 복호화
    const cipherEnc: Buffer = Buffer.from(base64Enc, 'base64');

    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let resData: string = '';
    resData += decipher.update(cipherEnc);
    resData += decipher.final();

    const jsondata = JSON.parse(Buffer.from(resData).toString());

    console.log(decodeURI(jsondata.utf8_name));
    console.log(jsondata);
    return resData;
  }

  async userLocalRegistration(userRegisterLocalDto: UserRegisterLocalDto) {
    try {
      console.log('LOCAL REGISTER');
      const resultVal = await this.redis.get(
        'nice_api_data:' + encodeURI(userRegisterLocalDto.token_version_id),
      );
      const key = resultVal.slice(0, 16);
      const iv = resultVal.slice(-16);

      const decryptUserData = this.niceService.decrypt(
        userRegisterLocalDto.enc_data,
        key,
        iv,
      );

      const dateOffset = 1000 * 60 * 60 * 9;

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
          ? new Date(Date.now() + dateOffset)
          : new Date('1901-01-01'),
        member_uuid: null,
        userAuthLocal: {
          auth_id: userRegisterLocalDto.auth_id,
          auth_password: userRegisterLocalDto.auth_password,
        },
      };
      console.log(createDto);
      const createResponse = await this.create(createDto);
      console.log(createResponse);

      await this.redis.del(
        'nice_api_data:' + encodeURI(userRegisterLocalDto.token_version_id),
      );

      return createResponse;
    } catch (err) {
      throw err;
    }
  }

  async authLoginChannelNaverRegister(
    authLoginChannelNaverRegisterDto: AuthLoginChannelNaverRegisterDto,
  ) {
    try {
      const token = await this.ngl.getAccessToken(
        authLoginChannelNaverRegisterDto.code,
        authLoginChannelNaverRegisterDto.state,
      );
      console.log(token.data);
      const user_info = await this.ngl.getUserInfo(token.data.access_token);
      console.log(user_info.data);

      const createDto: CreateUserDto = {
        auth_type: AuthType.ChannelNaver,
        user_name: user_info.data.name,
        user_gender: user_info.data.gender == 'M',
        user_born: new Date(
          user_info.data.birthday.substring(0, 4),
          user_info.data.birthday.substring(4, 6),
          user_info.data.birthday.substring(6, 8),
        ),
        user_email: user_info.data.email,
        user_ci: null,
        phone_number: null,
        phone_sns_agree: false,
        phone_sns_agree_date: null,
        member_uuid: null,
        userAuthChannelNaver: {
          channel_memberno: user_info.data.memberno,
          channel_ipd_custno: user_info.data.idp_custno,
          channel_access_token: token.data.access_token,
          channel_refresh_token: token.data.refresh_token,
        },
      };

      const createResponse = await this.create(createDto);
      console.log(createResponse);

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

  async authLoginChannelNaver(memberno: number) {
    const auth_channel_naver = await this.authChannelNaverRepository.findOne({
      relations: { userAuth: true },
      where: {
        channel_memberno: memberno,
      },
    });
    if (!auth_channel_naver) {
      return -2;
    }
    const user = await this.userRepository.findOne({
      relations: { userAuth: true },
      where: {
        userAuth: { uuid: auth_channel_naver.userAuth.uuid },
      },
    });
    return user;
  }

  async authLoginSnsNaver(authLoginSnsNaverDto: AuthLoginSnsNaverDto) {
    try {
      const get_naver_auth = await this.httpService
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
      if (!get_naver_auth.data.access_token) {
        Logger.error('authLoginSnsNaver: naver_auth access_token error');
        return -1;
      }
      console.log(get_naver_auth.data);

      const auth_token = `Bearer ${get_naver_auth.data.access_token}`;

      const get_naver_user = await this.httpService
        .get('https://openapi.naver.com/v1/nid/me', {
          headers: { Authorization: auth_token },
        })
        .toPromise();
      if (!get_naver_user.data.response.id) {
        Logger.error('authLoginSnsNaver: naver_user data error');
        return -1;
      }
      console.log(get_naver_user.data.response);

      const auth_sns_naver = await this.authSnsNaverRepository.findOne({
        relations: { userAuth: true },
        where: {
          sns_id: get_naver_user.data.response.id,
        },
      });

      // console.log(auth_sns_naver);
      // console.log(auth_sns_naver.userAuth);

      if (auth_sns_naver) {
        auth_sns_naver.sns_access_token = get_naver_auth.data.access_token;
        auth_sns_naver.sns_refresh_token = get_naver_auth.data.refresh_token;
        auth_sns_naver.sns_access_token_expires = new Date(
          new Date().getTime() + get_naver_auth.data.expires_in * 1000,
        );
        await this.authSnsNaverRepository.save(auth_sns_naver);

        const user = await this.userRepository.findOne({
          relations: { userAuth: true },
          where: {
            userAuth: { uuid: auth_sns_naver.userAuth.uuid },
          },
        });

        return user;
      } else {
        const createDto: CreateUserDto = {
          auth_type: AuthType.SnsNaver,
          user_name: get_naver_user.data.response.name,
          user_gender: get_naver_user.data.response.gender == 'M',
          user_born: new Date(
            get_naver_user.data.response.birthyear +
              '-' +
              get_naver_user.data.response.birthday,
          ),
          user_email: get_naver_user.data.response.email,
          user_ci: null,
          phone_number: get_naver_user.data.response.mobile,
          phone_sns_agree: false,
          phone_sns_agree_date: null,
          member_uuid: null,
          userAuthSnsNaver: {
            sns_id: get_naver_user.data.response.id,
            sns_access_token: get_naver_auth.data.access_token,
            sns_refresh_token: get_naver_auth.data.refresh_token,
            sns_access_token_expires: new Date(
              new Date().getTime() + get_naver_auth.data.expires_in * 1000,
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

      // console.log(get_naver_user.data);
    } catch (err) {
      throw err;
    }

    // return get;
  }

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
            // auth_id: createUserDto.userAuthLocal.auth_id,
            // auth_password: createUserDto.userAuthLocal.auth_password,
          });
          if (!(await this.authLocalDuplicateIdValidate(authLocal.auth_id))) {
            Logger.error('user_create: local auth id duplicated');
            return { status: CreateUserStatus.id_duplicated };
          }

          const post = await this.httpService
            .post(
              this.configService.getOrThrow('GAME_API_URL') + 'account/create',
              {
                UserID: createUserDto.userAuthLocal.auth_id,
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

          if (!(await queryRunner.manager.save(authLocal))) {
            Logger.error('user_create: auth local not gen');
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

        case AuthType.SnsNaver: {
          const authSnsNaver = new UserAuthSnsNaver({
            userAuth: userAuth,
            ...createUserDto.userAuthSnsNaver,
          });
          const post = await this.httpService
            .post(
              this.configService.getOrThrow('GAME_API_URL') + 'account/create',
              {
                UserID: 'sns_naver_test',
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
          console.log(createUserDto.userAuthChannelNaver);
          const authChannelNaver = new UserAuthChannelNaver({
            userAuth: userAuth,
            ...createUserDto.userAuthChannelNaver,
          });
          const post = await this.httpService
            .post(
              this.configService.getOrThrow('GAME_API_URL') + 'account/create',
              {
                UserID: 'channel_naver_test',
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

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOneToAuth(auth: UserAuth): Promise<User> {
    return this.userRepository.findOne({
      relations: { userAuth: true },
      where: { userAuth: { uuid: auth.uuid } },
    });
  }

  async findAuthLocalToId(auth_id: string): Promise<UserAuthLocal> {
    return this.authLocalRepository.findOne({
      relations: { userAuth: true },
      where: {
        auth_id: auth_id,
      },
    });
  }

  async findOne(user_uuid: string): Promise<User> {
    return this.userRepository.findOneBy({ user_uuid });
  }

  async findOneUserAuth(user_uuid: string): Promise<UserAuth> {
    const user = await this.userRepository.findOneBy({ user_uuid });
    return this.authRepository.findOneBy({ uuid: user.userAuth.uuid });
  }

  async findOneWithAuth(user_uuid: string): Promise<User> {
    return this.userRepository.findOne({
      where: { user_uuid },
      relations: { userAuth: true },
    });
  }

  async update(user_uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ user_uuid });
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

  async remove(user_uuid: string): Promise<DeleteResult> {
    const user = await this.findOneWithAuth(user_uuid);
    return this.authRepository.delete(user.userAuth.uuid);
  }

  // async authFindUser(auth_id: string): Promise<User> {
  //   return this.userRepository.findOne({
  //     relations: { userAuth: true },
  //     where: {
  //       userAuth: {
  //         auth_id: auth_id,
  //       },
  //     },
  //   });
  // }

  async authLocalDuplicateIdValidate(auth_id: string): Promise<boolean> {
    const authLocal = await this.authLocalRepository.findOneBy({
      auth_id: auth_id,
    });
    return !authLocal;
  }

  async user_registration(userRegistrationDto: UserRegistrationDto) {
    return await this.create({
      member_uuid: null,
      userAuthLocal: {
        auth_id: userRegistrationDto.auth_id,
        auth_password: userRegistrationDto.auth_password,
      },
      ...userRegistrationDto,
    });
  }

  async user_modify_info(
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

  async authLocalModifyPassword(
    userModifyPasswordDto: UserModifyPasswordDto,
    guard: { uuid: string },
    auth: UserAuth,
  ) {
    // const auth = await this.findOneUserAuth(guard.uuid);
    const authLocal = await this.authLocalRepository.findOneBy({
      userAuth: auth,
    });

    authLocal.auth_password = await encodePassword(
      userModifyPasswordDto.auth_password,
    );

    return await this.entityManager.save(authLocal);
  }

  async user_modify_password(
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
        break;
      }
      case AuthType.ChannelNaver: {
        break;
      }
      case AuthType.SnsNaver: {
        break;
      }
    }

    // const user = await this.findOneWithAuth(guard.uuid);
    //
    // user.userAuth.auth_password = await encodePassword(
    //   userModifyPasswordDto.auth_password,
    // );
    //
    // return await this.entityManager.save(user);
  }

  async userModifyCuid(
    userModifyCuidDto: UserModifyCuidDto,
    guard: { uuid: string },
  ) {
    // const user = await this.findOneWithAuth(guard.uuid);
    const user = await this.findOne(guard.uuid);
    user.member_cuid = userModifyCuidDto.cuid;
    return await this.entityManager.save(user);
  }

  async user_game_info_update_all() {
    let now = Date.now();
    const get = await this.httpService
      .get(this.configService.getOrThrow('GAME_API_URL') + 'account/test1')
      .toPromise();
    if (!get) {
      return 0;
    }
    Logger.log(
      `user_game_character_info_update get data latency ${Date.now() - now}ms`,
      `User`,
    );
    now = Date.now();

    console.log(get.data.length);

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
  }

  async user_game_info(guard: { uuid: string }) {
    const user = await this.findOne(guard.uuid);
    const user_info = await this.redis.hGetAll(
      'game_character_info:' + user.member_uuid,
    );

    console.log(user_info);

    const cuid_list = Object.keys(user_info);

    cuid_list.forEach((data) => {
      user_info[data] = JSON.parse(user_info[data]);
    });

    return { user_info: user_info, member_cuid: user.member_cuid };
  }

  async user_game_info_self_update(uuid: string) {
    let now = Date.now();
    const get = await this.httpService
      .get(
        this.configService.getOrThrow('GAME_API_URL') +
          'account/detail_list/' +
          uuid,
      )
      .toPromise();
    if (!get) {
      return 0;
    }
    Logger.log(
      `user_game_info_self_update get data latency ${Date.now() - now}ms`,
      `User`,
    );
    now = Date.now();

    // console.log(get.data);

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
      `user_game_info_self_update redis update latency ${Date.now() - now}ms`,
      `User`,
    );

    const fn_arr = [];

    for (const data of get.data) {
      fn_arr.push(
        this.user_game_info_avatar_update_self(
          data.UUID,
          data.CUID,
          JSON.stringify(data),
        ),
      );
    }

    // console.log(get.data);
    await Promise.all(fn_arr);

    // for (const data of get.data) {
    //   console.log(data.UUID, data.CUID);
    //   await this.user_game_info_avatar_update_self(
    //     data.UUID,
    //     data.CUID,
    //     JSON.stringify(data),
    //   );
    // }

    Logger.log(
      `user_game_info_self_update redis user_game_info_avatar_update update latency ${
        Date.now() - now
      }ms`,
      `User`,
    );
  }

  async user_game_info_detail(uuid: string, cuid: string) {
    const info_detail = await this.redis.hGet(
      'game_character_info:' + uuid,
      cuid,
    );
    console.log(info_detail);
    console.log(JSON.stringify(info_detail));

    return JSON.parse(info_detail);
  }

  async user_game_info_detail_update(cuid: string) {
    let now = Date.now();
    const get = await this.httpService
      .get(
        this.configService.getOrThrow('GAME_API_URL') +
          'account/detail/' +
          cuid,
      )
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

    const redis_arr = [];
    get.data.forEach((data) => {
      redis_arr.push(
        this.redis.hSet(
          'game_character_info:' + data.UUID,
          data.CUID,
          JSON.stringify(data),
        ),
      );
    });
    await Promise.all(redis_arr);

    Logger.log(
      `user_game_character_info_update redis update latency ${
        Date.now() - now
      }ms`,
      `User`,
    );
    return get.data[0];
  }

  async user_game_info_avatar_all(uuid: string) {
    const avatar_url_all = await this.redis.hGetAll(
      'game_character_avatar:' + uuid,
    );
    console.log(avatar_url_all);

    return avatar_url_all;
  }

  async user_game_info_avatar(uuid: string, cuid: string) {
    const avatar_url = await this.redis.hGet(
      'game_character_avatar:' + uuid,
      cuid,
    );

    if (!avatar_url) {
      return await this.user_game_info_avatar_update(uuid, cuid);
    }

    return avatar_url;
  }

  async user_game_info_avatar_update_self(
    uuid: string,
    cuid: string,
    character_info: string,
  ) {
    const post = await this.httpService
      .post(
        this.configService.getOrThrow('RENDER_API_URL') +
          'render/character/image/',
        character_info,
      )
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
    console.log(cuid);
  }

  async user_game_info_avatar_update(uuid: string, cuid: string) {
    let character_info = await this.redis.hGet(
      'game_character_info:' + uuid,
      cuid,
    );
    if (!character_info) {
      const detail_update = await this.user_game_info_detail_update(cuid);
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
      .post(
        this.configService.getOrThrow('RENDER_API_URL') +
          'render/character/image/',
        character_info,
      )
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

  async user_game_info_avatar_png(uuid: string, cuid: string) {
    const avatar_url = await this.redis.hGet(
      'game_character_avatar:' + uuid,
      cuid,
    );

    if (!avatar_url) {
      return (
        '<img src="data:image/png;base64,' +
        (await this.user_game_info_avatar_update(uuid, cuid)) +
        '">'
      );
    }

    return '<img src="data:image/png;base64,' + avatar_url + '">';
  }

  async nhn_registration_url() {
    return this.ngl.getAuthCodeUrl(
      this.configService.getOrThrow('DEV_NAVER_URL') + 'naver/getAccessToken',
      'aaaaaaaaaaaa',
    );
  }

  async nhn_registration(body: any) {
    console.log(body);
    return body;
  }

  async nhn_acc(auth: string) {
    const res: AxiosResponse = await this.ngl.getAccessToken(
      auth,
      'aaaaaaaaaaaa',
    );
    return res.data;
  }

  async nhn_get_user(token: string) {
    const res = await this.ngl.getUserInfo(token);
    return res.data;
  }
  async nhn_get_member(login: string) {
    const res = await this.ngl.getMemberStatus(login);
    return res.data;
  }

  async hmac_fn(login: string) {
    const res = await this.ngl.getMemberStatus(login);
    console.log(res);
    return res.data;
  }
  async test(auth_id: string) {
    const post = await this.httpService
      .post(this.configService.getOrThrow('GAME_API_URL') + 'account/create', {
        UserID: auth_id,
      })
      .toPromise();
    return post.data;
  }

  async user_migration() {
    const csvPath = path.join(__dirname + '/../../../04-25_mem.csv');
    const csv = fs.readFileSync(csvPath, 'utf-8');

    const m_user: any[] = Papa.parse(csv, {
      header: true,
      dynamicTyping: true,
    }).data;

    let fail_count = 0;
    let create_count = 0;
    let uncreate_count = 0;

    for (const user of m_user) {
      if (user.pwd != 'NULL' && user.pwd != null) {
        const m_userAuth = new UserAuth({
          auth_type: AuthType.Local,
          create_date: new Date(user.wdate * 1000),
        });
        const m_auth = new UserAuthLocal({
          auth_id: user.ID,
          auth_password: await encodePassword(user.pwd.toString()),
          create_date: new Date(user.wdate * 1000),
          userAuth: m_userAuth,
        });

        if (!user.bday) user.bday = 19010105;
        // if (!user.DupInfo) user.DupInfo = 'NOT';
        // if (!user.PhoneNumber) user.PhoneNumber = '000-0000-0000';
        if (!user.E_Mail) user.E_Mail = 'NOT@not.not';
        // if (!user.name) user.name = 'NOT';
        // if (user.PhoneNumber == '--') user.PhoneNumber = null;

        if (!user.name) {
          console.log('Fail | uuid: ' + user.UUID + ' id: ' + user.ID);
          fail_count++;
          continue;
        }

        const m_user = new User({
          phone_number: user.PhoneNumber,
          phone_sns_agree: false,
          phone_sns_agree_date: null,
          user_email: user.E_Mail,
          user_name: user.name,
          user_born: new Date(
            +user.bday.toString().substr(0, 4),
            +user.bday.toString().substr(4, 2),
            +user.bday.toString().substr(6, 2),
          ),
          user_gender: user.gender == 1,
          user_ci: null,
          member_uuid: user.mem_uuid,
          userAuth: m_userAuth,
          create_date: new Date(user.wdate * 1000),
        });

        if (!(await this.entityManager.save(m_auth))) {
          console.log('Fail | uuid: ' + user.UUID + ' id: ' + user.ID);
          fail_count++;
          continue;
        }
        if (!(await this.entityManager.save(m_user))) {
          console.log('Fail | uuid: ' + user.UUID + ' id: ' + user.ID);
          fail_count++;
          continue;
        }
        const mg_user = new UserMg({
          user_uuid: m_user.user_uuid,
          member_uuid: m_user.member_uuid,
          mg_id: user.ID,
          mg_uuid: user.UUID,
        });
        if (!(await this.entityManager.save(mg_user))) {
          console.log('Fail | uuid: ' + user.UUID + ' id: ' + user.ID);
          fail_count++;
          continue;
        }

        create_count++;
      } else {
        console.log('UnCreate | uuid: ' + user.UUID + ' id: ' + user.ID);
        uncreate_count++;
      }
    }
    console.log('CREATE COUNT : ' + create_count);
    console.log('UNCREATE COUNT : ' + uncreate_count);
    console.log('FAIL COUNT : ' + fail_count);
  }
}
