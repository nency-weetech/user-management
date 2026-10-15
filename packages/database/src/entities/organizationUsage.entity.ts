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

@Entity('organization_usages')
export class OrganizationUsage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  organization_id!: string;

  @ManyToOne(() => Organizations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organizations;

  @Column({ type: 'int', default: 0 })
  daily_bookmark_count!: number;

  @Column({ type: 'date', nullable: true })
  daily_bookmark_reset_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}