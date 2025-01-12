import { Module } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommend } from './entities/recommend.entity';
import { RecommendController } from './recommend.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommend]),
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
  controllers: [RecommendController],
  providers: [RecommendService],
  exports: [RecommendService],
})
export class RecommendModule {}
