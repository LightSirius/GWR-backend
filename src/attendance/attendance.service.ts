import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Raw, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceInsertDto } from './dto/attendance-insert.dto';
import {
  AttendanceInsertResponseDto,
  Status,
} from './dto/attendance-insert.response.dto';
import { AttendanceListDto } from './dto/attendance-list.dto';

@Injectable()
export class AttendanceService {
  private readonly GAME_API_URL = this.configService.getOrThrow('GAME_API_URL');
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,
  ) {}
  create(createAttendanceDto: CreateAttendanceDto) {
    const attendance = new Attendance(createAttendanceDto);
    return this.entityManager.save(attendance);
  }

  async attendanceDayList() {
    const now = new Date();
    const attendances = await this.attendanceRepository.findBy({
      create_date: Raw((alias) => `${alias} >= :date`, {
        date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
      }),
    });
    return attendances;
  }

  async attendanceList(
    attendanceListDto: AttendanceListDto,
    guard: { uuid: string },
  ) {
    const attendances = await this.attendanceRepository.findBy({
      create_date: Raw((alias) => `${alias} >= :date`, {
        date: `${attendanceListDto.year}-${attendanceListDto.month}-01`,
      }),
      user_uuid: guard.uuid,
    });
    return attendances;
  }

  async insertAttendance(
    attendanceInsertDto: AttendanceInsertDto,
    guard: { uuid: string },
  ): Promise<AttendanceInsertResponseDto> {
    const now = new Date();
    const day_count = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

    const check_attendance = await this.attendanceRepository.findOneBy({
      user_uuid: guard.uuid,
      create_date: Raw((alias) => `${alias} >= :date`, {
        date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
      }),
    });
    if (check_attendance) {
      return { status: Status.already };
    }

    const user = await this.userService.findOne(guard.uuid);

    if (!user.member_uuid) {
      Logger.error('insert_attendance: Not UUID', `Attendance`);
      return { status: Status.error };
    }

    if (!user.member_cuid) {
      Logger.error('insert_attendance: Not CUID', `Attendance`);
      return { status: Status.error };
    }

    const char = await this.userService.user_game_info_detail(
      user.member_uuid.toString(),
      user.member_cuid.toString(),
    );

    const attendance = await this.create({
      user_uuid: guard.uuid,
      attendance_comment: attendanceInsertDto.attendance_comment,
      member_uuid: user.member_uuid,
      member_cuid: user.member_cuid,
      char_NickName: char.NickName,
    });

    if (now.getDate() == day_count) {
      const attendance_month_count = await this.attendanceRepository.query(
        `SELECT count(*) FROM attendance where create_date >= '${now.getFullYear()}-${now.getMonth() + 1}-01' and user_uuid = '${guard.uuid}'`,
      );
      if (attendance_month_count[0].count == day_count) {
        const post = await this.httpService
          .post(this.GAME_API_URL + '/account/echo/insert', {
            UUID: user.member_uuid,
            Curr_Point: 100,
          })
          .toPromise();
        if (!post.data) {
          Logger.error(
            'insert_attendance: insert echo exception',
            `Attendance`,
          );
          return { status: Status.error };
        }
      }
    }

    const first_attendance = await this.attendanceRepository.query(
      `SELECT * FROM attendance where create_date >= CURRENT_DATE order by create_date limit 1`,
    );

    if (attendance.user_uuid == first_attendance[0].user_uuid) {
      const post = await this.httpService
        .post(this.GAME_API_URL + '/account/echo/insert', {
          UUID: user.member_uuid,
          Curr_Point: 30,
        })
        .toPromise();
      if (!post.data) {
        Logger.error('insert_attendance: insert echo exception', `Attendance`);
        return { status: Status.error };
      }
    } else {
      const post = await this.httpService
        .post(this.GAME_API_URL + '/account/echo/insert', {
          UUID: user.member_uuid,
          Curr_Point: 10,
        })
        .toPromise();
      if (!post.data) {
        Logger.error('insert_attendance: insert echo exception', `Attendance`);
        return { status: Status.error };
      }
    }

    return { status: Status.success };
  }
}
