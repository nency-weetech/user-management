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
import { User } from './user.entity';

@Entity('organization_invites')
export class OrganizationInvite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  organization_id!: string;

  @ManyToOne(() => Organizations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organizations;

  @Column()
  email!: string;

  @Column({ type: 'uuid' })
  invited_by!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by' })
  invited_user!: User;

  @Column({ unique: true })
  token!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted'],
    default: 'pending',
  })
  status!: 'pending' | 'accepted';

  @Column({ type: 'timestamp with time zone' })
  expires_at!: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  accepted_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}