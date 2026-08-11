import { User } from 'src/users/entities/user.entity';
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

@Entity('new-fetch-log')
export class NewsFetchLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  query!: string;

  @Column({ default: 0 })
  articlesFetched!: number;

  @Column({ type: 'enum', enum: fetchTrigger })
  triggeredBy!: fetchTrigger;

  @Column({ nullable: true })
  triggeredByUserId!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'triggeredByUserId' })
  triggeredByUser!: User | null;

  @Column({ default: true })
  success!: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'int', default: 0 })
  durationMs!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
