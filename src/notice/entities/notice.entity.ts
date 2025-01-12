import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NoticeType {
  'notice',
  'update',
  'event',
}
@Entity()
export class Notice {
  constructor(notice: Partial<Notice>) {
    Object.assign(this, notice);
  }

  @PrimaryGeneratedColumn()
  notice_id: number;

  @Column({ type: 'enum', enum: NoticeType, default: NoticeType.notice })
  notice_type: NoticeType;

  @Column()
  notice_title: string;

  @Column()
  notice_contents: string;

  @Column({ default: null })
  notice_thumbnail: string;

  @Column({ default: false })
  notice_fix: boolean;

  @Column({ default: 0 })
  comment_count: number;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  recommend_count: number;

  @Column({ default: false })
  info_delete: boolean;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;
}
