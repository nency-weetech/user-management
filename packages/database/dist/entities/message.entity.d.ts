import { Room } from './room.entity';
import { User } from './user.entity';
export declare class Message {
    id: string;
    content: string;
    sender_id: string;
    sender: User;
    room_id: string;
    room: Room;
    file_key: string;
    file_name: string;
    file_type: string;
    created_at: Date;
}
