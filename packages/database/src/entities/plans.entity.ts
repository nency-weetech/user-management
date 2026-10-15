import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PlanTargetType } from "../enums/plan-target-type.enum";
import { PlanType } from "../enums/plan.enum";

@Entity('plans_catalog')
export class Plans_catalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PlanTargetType,
  })
  target_type: PlanTargetType;

  @Column({
    type: 'enum',
    enum: PlanType,
  })
  name: PlanType;

  @Column({
    type: 'integer',
  })
  price: number;

  @Column({
    type: 'varchar',
    length: 3,
  })
  currency: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  daily_view_limit: number | null;

  @Column({
    type: 'integer',
    nullable: true,
  })
  daily_fetch_limit: number | null;

  @Column({
    type: 'integer',
    nullable: true,
  })
  profile_limit: number | null;

  @Column({
    type: 'integer',
    nullable: true,
  })
  bookmark_limit: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}