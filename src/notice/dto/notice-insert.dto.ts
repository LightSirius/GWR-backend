import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NoticeType } from '../entities/notice.entity';

export class NoticeInsertDto {
  @ApiProperty({ description: 'notice_type' })
  @IsEnum(NoticeType)
  notice_type: NoticeType;
  @ApiProperty({ description: 'notice_title' })
  @IsString()
  notice_title: string;
  @ApiProperty({ description: 'notice_contents' })
  @IsString()
  notice_contents: string;
  @ApiProperty({ description: 'notice_thumbnail' })
  @IsOptional()
  @IsString()
  notice_thumbnail?: string;
  @ApiProperty({ description: 'notice_fix' })
  @IsBoolean()
  notice_fix: boolean;
  @ApiProperty({ description: 'notice_contents_es' })
  @IsString()
  notice_contents_es: string;
}
