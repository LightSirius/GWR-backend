import { Module } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';
import { RedisModule } from '../redis/redis.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './entities/notice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notice]),
    RedisModule,
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        node: configService.getOrThrow('ELASTIC_HOST'),
        auth: {
          username: configService.getOrThrow('ELASTIC_USERNAME'),
          password: configService.getOrThrow('ELASTIC_PASSWORD'),
        },
        tls: {
          ca: configService.getOrThrow('ELASTIC_TLS_CRT'),
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {}
