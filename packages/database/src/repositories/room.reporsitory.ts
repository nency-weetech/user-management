import { InjectRepository } from '@nestjs/typeorm';
import { IRoomRepository } from '../interfaces/room.interface';
import { Room } from '../entities/room.entity';
import { Repository } from 'typeorm';

export class RoomRepository implements IRoomRepository {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  async create(room: Partial<Room>): Promise<Room> {
    const newRoom = this.roomRepository.create(room);
    console.log(newRoom)
    return await this.roomRepository.save(newRoom);
  }

  async findById(id: string): Promise<Room | null> {
    return this.roomRepository.findOne({ where: { id: id } });
  }

  async findByOwnerId(ownerId: string): Promise<Room[]> {
    return this.roomRepository.find({ where: { owner_id: ownerId } });
  }

  async findByUserId(userId: string): Promise<Room[]> {
    return this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.members', 'member', 'member.user_id = :userId', {
        userId,
      })
      .getMany();
  }
}
