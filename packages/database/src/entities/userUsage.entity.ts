import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_usages')
export class UserUsage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, unique: true })
  user_id!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'int', default: 0 })
  daily_article_view_count!: Number;

  @Column({ nullable: true })
  daily_article_view_reset_at!: Date;

  @Column({ type: 'int', default: 0 })
  daily_bookmark_count!: number;

  @Column({ type: 'date', nullable: true })
  daily_bookmark_reset_at!: Date | null;
  
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
