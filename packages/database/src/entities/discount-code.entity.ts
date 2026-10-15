import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('discount_codes')
export class DiscountCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string; 

  @Column({ type: 'int' })
  flat_amount!: number; 

  @Column()
  currency!: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expires_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;
}
