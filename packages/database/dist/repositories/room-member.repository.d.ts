import { IRoomMemberRepository } from '../interfaces/room-member.interface';
import { RoomMember } from '../entities/roomMember.entity';
import { Repository } from 'typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
export declare class RoomMemberRepository extends BaseAbstractRepostitory<RoomMember> implements IRoomMemberRepository {
    private readonly roomMemberRepo;
    constructor(roomMemberRepo: Repository<RoomMember>);
    createRoomMember(roomMember: Partial<RoomMember>): Promise<RoomMember>;
    findByUserAndRoom(userId: string, roomId: string): Promise<RoomMember | null>;
    findByRoomId(roomId: string): Promise<RoomMember[]>;
    findByAdminsForRoom(roomId: string): Promise<RoomMember[]>;
}
