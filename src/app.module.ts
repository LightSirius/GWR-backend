import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { PaymentModule } from './payment/payment.module';
import { BoardModule } from './board/board.module';
import { CommentModule } from './comment/comment.module';
import { NoticeModule } from './notice/notice.module';
import { RecommendModule } from './recommend/recommend.module';
import { GameModule } from './game/game.module';
import { NiceModule } from './nice/nice.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    AuthModule,
    RedisModule,
    PaymentModule,
    BoardModule,
    CommentModule,
    NoticeModule,
    RecommendModule,
    GameModule,
    NiceModule,
    AttendanceModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
