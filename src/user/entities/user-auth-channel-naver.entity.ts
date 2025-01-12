import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAuth } from './user-auth.entity';

@Entity()
export class UserAuthChannelNaver {
  constructor(userAuthChannelNaver: Partial<UserAuthChannelNaver>) {
    Object.assign(this, userAuthChannelNaver);
  }

  @OneToOne(() => UserAuth, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  userAuth: UserAuth;

  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  channel_ipd_custno: number;

  @Column()
  channel_memberno: number;

  @Column()
  channel_access_token: string;

  @Column()
  channel_refresh_token: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;
}
