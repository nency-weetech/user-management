import { IRoomRepository } from '../interfaces/room.interface';
import { Room } from '../entities/room.entity';
import { Repository } from 'typeorm';
export declare class RoomRepository implements IRoomRepository {
    private readonly roomRepository;
    constructor(roomRepository: Repository<Room>);
    create(room: Partial<Room>): Promise<Room>;
    findById(id: string): Promise<Room | null>;
    findByOwnerId(ownerId: string): Promise<Room[]>;
    findByUserId(userId: string): Promise<Room[]>;
}
