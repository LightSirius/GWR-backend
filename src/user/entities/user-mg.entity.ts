import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserMg {
  constructor(userMg: Partial<UserMg>) {
    Object.assign(this, userMg);
  }

  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  user_uuid: string;

  @Column()
  member_uuid: number;

  @Column()
  mg_id: string;

  @Column()
  mg_uuid: string;
}
