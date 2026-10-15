import { Room } from './room.entity';
import { User } from './user.entity';
import { JoinRequestStatus } from '../enums/join-request-status.dto';
export declare class RoomJoinRequest {
    id: string;
    user_id: string;
    user: User;
    room_id: string;
    room: Room;
    status: JoinRequestStatus;
    requested_at: Date;
    reviewed_by_id: string;
    reviewed_by: User;
    reviewed_at: Date;
}
