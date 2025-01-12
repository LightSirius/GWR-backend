import { Module } from '@nestjs/common';
import { NiceController } from './nice.controller';
import { NiceService } from './nice.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [NiceController],
  providers: [NiceService],
  exports: [NiceService],
})
export class NiceModule {}
