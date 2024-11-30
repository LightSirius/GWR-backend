import { EventType } from '../entities/event.entity';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class EventInsertDto {
  @ApiProperty({ description: 'event_type' })
  @IsEnum(EventType)
  event_type: EventType;
  @ApiProperty({ description: 'event_title' })
  @IsString()
  event_title: string;
  @ApiProperty({ description: 'event_contents' })
  @IsOptional()
  @IsString()
  event_contents?: string;
  @ApiProperty({ description: 'event_contents_es' })
  @IsOptional()
  @IsString()
  event_contents_es?: string;
  @ApiProperty({ description: 'event_start' })
  @IsDate()
  @Type(() => Date)
  event_start: Date;
  @ApiProperty({ description: 'event_end' })
  @IsDate()
  @Type(() => Date)
  event_end: Date;
  @ApiProperty({ description: 'event_thumbnail' })
  @IsString()
  event_thumbnail: string;
  @ApiProperty({ description: 'event_url' })
  @IsString()
  event_url: string;
}
