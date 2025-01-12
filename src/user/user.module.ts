import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
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
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
