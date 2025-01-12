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
export class User {
  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }

  @PrimaryGeneratedColumn('uuid')
  user_uuid: string;

  @Column()
  user_name: string;

  @Column()
  user_gender: boolean;

  @Column()
  user_born: Date;

  @Column()
  user_email: string;

  @Column({ default: null })
  user_ci: string;

  @Column({ default: null })
  phone_number: string;

  @Column({ default: false })
  phone_sns_agree: boolean;

  @Column({ default: null })
  phone_sns_agree_date: Date;

  @Column({ default: null })
  member_uuid: number;

  @Column({ default: null })
  member_cuid: number;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @OneToOne(() => UserAuth, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  userAuth: UserAuth;
}
