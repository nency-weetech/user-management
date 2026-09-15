import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { RoomMember } from './roomMember.entity';
import { Message } from './message.entity';
import { Room } from './room.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: '255',
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: '255',
    select: false,
  })
  @Exclude()
  password!: string;

  @Column({ type: 'varchar', length: 100 })
  first_name!: string;

  @Column({ type: 'varchar', length: 100 })
  last_name!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_active!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_email_verified!: boolean;

  @OneToMany(() => RoomMember, (roomMember) => roomMember.user)
  room_memberships!: RoomMember[];

  @OneToMany(() => Message, (message) => message.sender)
  messages!: Message[];

  @OneToMany(() => Room, (room) => room.owner)
  owned_rooms!: Room[];

  @Column({ type: 'varchar', nullable: true })
  email_verification_otp?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  email_verification_expires?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  password_reset_otp?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_otp_expires?: Date | null;

  @Column({ type: 'int', default: 0 })
  otp_attempts!: number;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @Column({ default: false })
  is_pending_deletion!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletion_requested_at!: Date | null;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  @Exclude()
  deleted_at!: Date | null;
}
