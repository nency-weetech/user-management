import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Exclude } from 'class-transformer';

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
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

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
  isActive!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  isEmailVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationOtp?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpires?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  passwordResetOtp?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetOtpExpires?: Date | null;

  @Column({ type: 'int', default: 0 })
  otpAttempts!: number;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  @Exclude()
  deletedAt!: Date | null;
}
