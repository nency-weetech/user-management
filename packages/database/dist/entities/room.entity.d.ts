import { User } from './user.entity';
import { Message } from './message.entity';
import { RoomMember } from './roomMember.entity';
import { RoomType } from '../enums/room-type-enum';
export declare class Room {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    owner: User;
    created_at: Date;
    messages: Message[];
    members: RoomMember[];
    type: RoomType;
}
