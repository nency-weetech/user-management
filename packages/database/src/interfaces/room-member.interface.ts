import { RoomMember } from '../entities/roomMember.entity';

export interface IRoomMemberRepository {
  create(
    roomMember: Partial<RoomMember>,
  ): Promise<RoomMember>;

  findByUserAndRoom(
    userId: string,
    roomId: string,
  ): Promise<RoomMember | null>;

  findByRoomId(
    roomId: string,
  ): Promise<RoomMember[]>;
}