import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

export enum PdfJobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

@Entity('pdf_jobs')
@Index('pdf_jobs_owner_status_idx', ['owner_id', 'status'])
@Index('pdf_jobs_expires_idx', ['expires_at'], { where: `"status" = 'ready'` })
export class PdfJob {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  owner_id!: string;

  @Column({ type: 'varchar', default: PdfJobStatus.QUEUED })
  status!: PdfJobStatus;

  @Column({ type: 'varchar', nullable: true })
  object_key!: string | null;

  @Column({ type: 'varchar', nullable: true })
  filename!: string | null;

  @Column({ type: 'text', nullable: true })
  error!: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expires_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}