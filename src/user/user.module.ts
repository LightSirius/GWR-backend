import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserDevController } from './user-dev.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '../redis/redis.module';
import { UserMg } from './entities/user-mg.entity';
import { UserAuthLocal } from './entities/user-auth-local.entity';
import { UserAuthSnsNaver } from './entities/user-auth-sns-naver.entity';
import { UserAuthChannelNaver } from './entities/user-auth-channel-naver.entity';
import { NiceModule } from '../nice/nice.module';
import { GameCharacterService } from './services/game-character.service';
import { AvatarService } from './services/avatar.service';

// 개발 환경에서만 테스트 컨트롤러 활성화
const isDevelopment = process.env.NODE_ENV !== 'production';
const controllers = isDevelopment 
  ? [UserController, UserDevController] 
  : [UserController];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserAuth,
      UserAuthLocal,
      UserAuthSnsNaver,
      UserAuthChannelNaver,
      UserMg,
    ]),
    HttpModule,
    RedisModule,
    NiceModule,
  ],
  controllers,
  providers: [UserService, GameCharacterService, AvatarService],
  exports: [UserService, GameCharacterService, AvatarService],
})
export class UserModule {}
