import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Room } from './room.entity';
import { User } from './user.entity';
import { RoomMemberRole } from '../enums/room-member-role.enum';

@Entity('room_members')
@Unique('UQ_ROOM_MEMBER_USER_ROOM', ['user_id', 'room_id'])
@Index('IDX_ROOM_MEMBERS_ROOM_ID', ['room_id'])
@Index('IDX_ROOM_MEMBERS_USER_ID', ['user_id'])
export class RoomMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, (user) => user.room_memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid' })
  room_id!: string;

  @ManyToOne(() => Room, (room) => room.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @Column({
    type: 'enum',
    enum: RoomMemberRole,
    default: RoomMemberRole.MEMBER,
  })
  role!: RoomMemberRole;

  @CreateDateColumn({ type: 'timestamp' })
  joined_at!: Date;
}
