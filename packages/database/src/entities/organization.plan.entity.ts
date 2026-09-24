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

@Entity('organization_plans')
export class OrganizationPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' , unique: true})
  organization_id!: string;

  @ManyToOne(() => Organizations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organizations;

  @Column({
    type: 'enum',
    enum: OrganizationPlanEnum,
    default: OrganizationPlanEnum.FREE,
  })
  plan!: OrganizationPlanEnum;

  @Column({ type: 'timestamp with time zone', nullable: true })
  plan_upgraded_at!: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}
