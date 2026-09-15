import { User } from './user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum fetchTrigger {
  CORN = 'corn',
  ADMIN = 'admin',
}

@Entity('news_fetch_logs')
export class NewsFetchLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  query!: string;

  @Column({ default: 0 })
  articles_fetched!: number;

  @Column({ type: 'enum', enum: fetchTrigger })
  trigger_type!: fetchTrigger;

  @Column({ nullable: true })
  triggered_by_user_id!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'triggeredByUserId' })
  triggered_by_user!: User | null;

  @Column({ default: true })
  success!: boolean;

  @Column({ type: 'text', nullable: true })
  error_message!: string | null;

  @Column({ type: 'int', default: 0 })
  duration_ms!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
