import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Message } from './message.entity';
import { RoomMember } from './roomMember.entity';

@Entity('rooms')
@Index('IDX_ROOMS_OWNER_ID', ['owner_id'])
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'uuid',
  })
  owner_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToMany(() => Message, (message) => message.room)
  messages!: Message[];

  @OneToMany(() => RoomMember, (roomMember) => roomMember.room)
  members!: RoomMember[];
}
