import { BaseInterfaceRepository } from '../common/base.interface';
import { RoomMember } from '../entities/roomMember.entity';
export interface IRoomMemberRepository extends BaseInterfaceRepository<RoomMember> {
    createRoomMember(roomMember: Partial<RoomMember>): Promise<RoomMember>;
    findByUserAndRoom(userId: string, roomId: string): Promise<RoomMember | null>;
    findByRoomId(roomId: string): Promise<RoomMember[]>;
    findByAdminsForRoom(roomId: string): Promise<RoomMember[]>;
}
