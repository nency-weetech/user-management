import { IRoomRepository } from '../interfaces/room.interface';
import { Room } from '../entities/room.entity';
import { Repository } from 'typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { RoomType } from '../enums/room-type-enum';
export declare class RoomRepository extends BaseAbstractRepostitory<Room> implements IRoomRepository {
    private readonly roomRepository;
    constructor(roomRepository: Repository<Room>);
    createRoom(room: Partial<Room>): Promise<Room>;
    findById(id: string): Promise<Room | null>;
    findByOwnerId(ownerId: string): Promise<Room[]>;
    findByUserId(userId: string): Promise<Room[]>;
    findAllByType(type: RoomType): Promise<Room[]>;
}
