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

@Entity('Payments')
export class Payments {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  userId!: string | null;

  @ManyToMany(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user!: User | null;

  @Column({ unique: true })
  stripeCheckoutSessionId!: string;

  @Column({ nullable: true })
  stripePaymentIntentId!: string;

  @Column({type: 'enum', enum: UserPlanEnum})
  plan!:UserPlanEnum;

  @Column()
  amount!: Number;

  @Column()
  currency!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt!: Date;

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt!: Date;
}
