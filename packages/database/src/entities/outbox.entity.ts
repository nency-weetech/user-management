import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('outbox')
export class Outbox{
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: 'varchar'})
    aggregate_type!: string;

    @Column({type: 'varchar'})
    aggregate_id!: string;

    @Column({type: 'varchar'})
    event_type!: string;

    @Column({ type: 'jsonb'})
    payload!: Record<string, unknown>;

    @Column({type: 'varchar', nullable: true})
    trace_id!: string;

    @CreateDateColumn({type: 'timestamptz'})
    created_at!: Date;
}