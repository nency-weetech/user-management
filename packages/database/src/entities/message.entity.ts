import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Room } from './room.entity';
import { User } from './user.entity';

@Entity('message')
@Index('IDX_MESSAGE_ROOM_CREATED_AT', ['room_id', 'created_at'])
@Index('IDX_MESSAGE_SENDER_ID', ['sender_id'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'uuid' })
  sender_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @Column({ type: 'uuid' })
  room_id!: string;

  @ManyToOne(() => Room, (room) => room.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column({type: 'varchar', nullable: true})
  file_key!: string;

  @Column({type: 'varchar', nullable: true})
  file_name!: string;

  @Column({type: 'varchar', nullable: true})
  file_type!: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  created_at!: Date;
}
