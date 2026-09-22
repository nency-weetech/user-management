import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationMembers } from './organizationMember.entity';
import { Roles } from './role.entity';

@Entity('member_roles')
export class MemberRoles {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  organization_member_id!: string;

  @ManyToOne(() => OrganizationMembers, {onDelete: 'CASCADE'})
  @JoinColumn({ name: 'organization_member_id' })
  organization_member!: OrganizationMembers;

  @Column({type: 'uuid'})
  role_id!: string;

  @ManyToOne(() => Roles, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'role_id'})
  roles!: Roles;

  @CreateDateColumn({type: 'timestamp with time zone'})
  assigned_at!: Date;
}
