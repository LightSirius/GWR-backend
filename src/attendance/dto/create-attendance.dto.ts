import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'user_uuid' })
  @IsString()
  user_uuid: string;
  @ApiProperty({ description: 'attendance_comment' })
  @IsString()
  attendance_comment: string;
  @ApiProperty({ description: 'member_uuid' })
  @IsNumber()
  member_uuid: number;
  @ApiProperty({ description: 'member_cuid' })
  @IsNumber()
  member_cuid: number;
  @ApiProperty({ description: 'char_NickName' })
  @IsString()
  char_NickName: string;
}
