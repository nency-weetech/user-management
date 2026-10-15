import { RoomJoinRequest } from '../entities/room-join-request.entity';
import { JoinRequestStatus } from '../enums/join-request-status.dto';
export interface JoinRequestInterface {
    createJoinRequest(userId: string, roomId: string): Promise<RoomJoinRequest>;
    hasPending(userId: string, roomId: string): Promise<boolean>;
    findPendingRequestsForRoom(roomId: string): Promise<RoomJoinRequest[]>;
    findRequestById(requestId: string): Promise<RoomJoinRequest | null>;
    updateRequestStatus(requestId: string, status: JoinRequestStatus, reviewedById: string): Promise<void>;
}
