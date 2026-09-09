import { Room } from './room.entity';
import { User } from './user.entity';
import { JoinRequestStatus } from '../enums/join-request-status.dto';
export declare class RoomJoinRequest {
    id: string;
    userId: string;
    user: User;
    roomId: string;
    room: Room;
    status: JoinRequestStatus;
    requestedAt: Date;
    reviewedById: string;
    reviewedBy: User;
    reviewedAt: Date;
}
