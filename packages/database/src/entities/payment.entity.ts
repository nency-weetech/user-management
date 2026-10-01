import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Organizations } from './organization.entity';
import { Plans_catalog } from './plans.entity';

@Entity('payments')
export class Payments {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  user_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ nullable: true, type: 'uuid' })
  organization_id?: string;

  @ManyToOne(() => Organizations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organizations;

  @Column({ nullable: true })
  stripe_checkout_session_id!: string | null;

  @Column({ unique: true })
  stripe_payment_intent_id!: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  plan_id!: string;

  @ManyToOne(() => Plans_catalog, { nullable: false })
  @JoinColumn({ name: 'plan_id' })
  plan!: Plans_catalog;

  @Column()
  amount!: number;

  @Column()
  currency!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @Column({ type: 'varchar', nullable: true })
  stripe_invoice_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  invoice_status: string | null;
}
