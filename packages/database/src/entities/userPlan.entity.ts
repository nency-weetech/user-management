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

@Entity('UserPlan')
export class UserPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({nullable: true})
  userId!: string|null;

  @ManyToOne(()=> User, {nullable: true, onDelete: 'SET NULL'})
  @JoinColumn({name: 'userId'})
  user: User|null;

  @Column({ type: 'enum', enum: UserPlanEnum, default: UserPlanEnum.FREE })
  plan!: UserPlanEnum;

  @Column({ type: 'timestamp with time zone', nullable: true })
  planUpgradedAt!: Date;

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt!: Date;

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt!: Date;
}
