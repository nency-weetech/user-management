import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserPlanEnum } from '../enums/user-plan.enum';
import { User } from './user.entity';
import { Plans_catalog } from './plans.entity';

@Entity('user_plans')
export class UserPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true, type: 'uuid' })
  user_id!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => Plans_catalog, { nullable: false })
  @JoinColumn({ name: 'plan_id' })
  plan: Plans_catalog;

  @Column({ name: 'plan_id', type: 'uuid' })
  plan_id: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  plan_upgraded_at!: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
