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

@Entity('user_plans')
export class UserPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({nullable: true})
  user_id!: string|null;

  @ManyToOne(()=> User, {nullable: true, onDelete: 'SET NULL'})
  @JoinColumn({name: 'userId'})
  user: User|null;

  @Column({ type: 'enum', enum: UserPlanEnum, default: UserPlanEnum.FREE })
  plan!: UserPlanEnum;

  @Column({ type: 'timestamp with time zone', nullable: true })
  plan_upgraded_at!: Date;

  @CreateDateColumn({type: 'timestamp with time zone'})
  created_at!: Date;

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updated_At!: Date;
}
