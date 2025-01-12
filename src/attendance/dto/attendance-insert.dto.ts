import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AttendanceInsertDto {
  @ApiProperty({ description: 'attendance_comment' })
  @IsString()
  attendance_comment: string;
}
