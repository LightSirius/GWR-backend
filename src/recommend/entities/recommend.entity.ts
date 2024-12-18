import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Recommend {
  constructor(recommend: Partial<Recommend>) {
    Object.assign(this, recommend);
  }

  @PrimaryGeneratedColumn()
  recommend_id: number;

  @Column()
  board_id: number;

  @Column({ type: 'uuid' })
  user_uuid: string;

  @CreateDateColumn()
  create_date: Date;
}
