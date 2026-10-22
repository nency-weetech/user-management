import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('processed_events')
export class ProcessedEvent {
  @PrimaryColumn({ type: 'text' })
  event_id: string;

  @PrimaryColumn({ type: 'text' })
  consumer: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  processed_at: Date;
}
