import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EventType {
  'board',
  'promotion',
}

@Entity()
export class Event {
  constructor(event: Partial<Event>) {
    Object.assign(this, event);
  }

  @PrimaryGeneratedColumn()
  event_id: number;

  @Column({ type: 'enum', enum: EventType })
  event_type: EventType;

  @Column()
  event_title: string;

  @Column()
  event_contents: string;

  @Column()
  event_start: Date;

  @Column()
  event_end: Date;

  @Column({ default: null })
  event_thumbnail: string;

  @Column({ default: null })
  event_url: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;
}
