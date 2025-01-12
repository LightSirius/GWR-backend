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
export class UserAuthSnsNaver {
  constructor(userAuthSnsNaver: Partial<UserAuthSnsNaver>) {
    Object.assign(this, userAuthSnsNaver);
  }

  @OneToOne(() => UserAuth, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  userAuth: UserAuth;

  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  sns_id: string;

  @Column()
  sns_access_token: string;

  @Column()
  sns_refresh_token: string;

  @Column()
  sns_access_token_expires: Date;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;
}
