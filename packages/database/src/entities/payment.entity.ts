import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { UserPlanEnum } from '../enums/user-plan.enum';

@Entity('payments')
export class Payments {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  user_id!: string | null;

  @ManyToMany(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @Column({ nullable: true })
  stripe_checkout_session_id!: string|null;

  @Column({ unique: true })
  stripe_payment_intent_id!: string;

  @Column({type: 'enum', enum: UserPlanEnum})
  plan!:UserPlanEnum;

  @Column()
  amount!: Number;

  @Column()
  currency!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @CreateDateColumn({type: 'timestamp with time zone'})
  created_at!: Date;

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updated_at!: Date;
}
