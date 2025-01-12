import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AuthType {
  'Local',
  'SnsNaver',
  'ChannelNaver',
}

@Entity()
export class UserAuth {
  constructor(userAuth: Partial<UserAuth>) {
    Object.assign(this, userAuth);
  }

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'enum', enum: AuthType })
  auth_type: AuthType;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;
}
