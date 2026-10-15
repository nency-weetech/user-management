import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organizations } from './organization.entity';
import { OrganizationPlanEnum } from '../enums/organization.plan.enum';
import { Plans_catalog } from './plans.entity';

@Entity('organization_plans')
export class OrganizationPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  organization_id!: string;

  @ManyToOne(() => Organizations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organizations;

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
