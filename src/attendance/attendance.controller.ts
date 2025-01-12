import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AttendanceInsertDto } from './dto/attendance-insert.dto';
import { AttendanceListDto } from './dto/attendance-list.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('insert')
  async insert_attendance(
    @Body() attendanceInsertDto: AttendanceInsertDto,
    @Request() req,
  ) {
    return this.attendanceService.insertAttendance(
      attendanceInsertDto,
      req.user,
    );
  }

  @Get('day/list')
  async attendance_day_list() {
    return await this.attendanceService.attendanceDayList();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('list')
  async atl(@Body() attendanceListDto: AttendanceListDto, @Request() req) {
    return this.attendanceService.attendanceList(attendanceListDto, req.user);
  }
}
