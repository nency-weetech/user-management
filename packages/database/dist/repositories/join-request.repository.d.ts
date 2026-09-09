import { RoomJoinRequest } from '../entities/room-join-request.entity';
import { JoinRequestInterface } from '../interfaces/join-request.interface';
import { Repository } from 'typeorm';
import { JoinRequestStatus } from '../enums/join-request-status.dto';
export declare class JoinRequestRepository implements JoinRequestInterface {
    private joinRequestRepo;
    constructor(joinRequestRepo: Repository<RoomJoinRequest>);
    createJoinRequest(userId: string, roomId: string): Promise<RoomJoinRequest>;
    hasPending(userId: string, roomId: string): Promise<boolean>;
    findPendingRequestsForRoom(roomId: string): Promise<RoomJoinRequest[]>;
    findRequestById(requestId: string): Promise<RoomJoinRequest | null>;
    updateRequestStatus(requestId: string, status: JoinRequestStatus, reviewedById: string): Promise<void>;
    findAllPendingForUser(userId: string): Promise<RoomJoinRequest[]>;
}
