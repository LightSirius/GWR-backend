import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Attendance {
  constructor(attendance: Partial<Attendance>) {
    Object.assign(this, attendance);
  }

  @PrimaryGeneratedColumn()
  attendance_id: number;

  @Index()
  @Column()
  user_uuid: string;

  @Column()
  member_uuid: number;

  @Column()
  member_cuid: number;

  @Column({ default: null })
  char_NickName: string;

  @Column()
  attendance_comment: string;

  @Index()
  @CreateDateColumn()
  create_date: Date;
}
