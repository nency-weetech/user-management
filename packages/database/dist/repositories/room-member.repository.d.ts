import { IRoomMemberRepository } from '../interfaces/room-member.interface';
import { RoomMember } from '../entities/roomMember.entity';
import { Repository } from 'typeorm';
export declare class RoomMemberRepository implements IRoomMemberRepository {
    private readonly roomMemberRepo;
    constructor(roomMemberRepo: Repository<RoomMember>);
    create(roomMember: Partial<RoomMember>): Promise<RoomMember>;
    findByUserAndRoom(userId: string, roomId: string): Promise<RoomMember | null>;
    findByRoomId(roomId: string): Promise<RoomMember[]>;
}
