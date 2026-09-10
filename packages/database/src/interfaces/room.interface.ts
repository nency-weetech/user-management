import { BaseInterfaceRepository } from '../common/base.interface';
import { Room } from '../entities/room.entity';

export interface IRoomRepository extends BaseInterfaceRepository<Room> {
  createRoom(room: Partial<Room>): Promise<Room>;

  findById(id: string): Promise<Room | null>;

  findByOwnerId(ownerId: string): Promise<Room[]>;

  findByUserId(userId: string): Promise<Room[]>;
}