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
export class UserAuthLocal {
  constructor(userAuthLocal: Partial<UserAuthLocal>) {
    Object.assign(this, userAuthLocal);
  }

  @OneToOne(() => UserAuth, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  userAuth: UserAuth;

  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  auth_id: string;

  @Column()
  auth_password: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;
}
