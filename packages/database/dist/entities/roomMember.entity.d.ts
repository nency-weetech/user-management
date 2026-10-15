import { Room } from './room.entity';
import { User } from './user.entity';
import { RoomMemberRole } from '../enums/room-member-role.enum';
export declare class RoomMember {
    id: string;
    user_id: string;
    user: User;
    room_id: string;
    room: Room;
    role: RoomMemberRole;
    joined_at: Date;
}
