import { Room } from './room.entity';
import { User } from './user.entity';
export declare class Message {
    id: string;
    content: string;
    sender_id: string;
    sender: User;
    room_id: string;
    room: Room;
    created_at: Date;
}
