import { Room } from '../entities/room.entity';
export interface IRoomRepository {
    create(room: Partial<Room>): Promise<Room>;
    findById(id: string): Promise<Room | null>;
    findByOwnerId(ownerId: string): Promise<Room[]>;
    findByUserId(userId: string): Promise<Room[]>;
}
