import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { UserModule } from '../user/user.module';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    UserModule,
    HttpModule.register({
      timeout: 180000,
      maxRedirects: 5,
    }),
    RedisModule,
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
