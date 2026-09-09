import { InjectRepository } from '@nestjs/typeorm';
import { IRoomRepository } from '../interfaces/room.interface';
import { Room } from '../entities/room.entity';
import { Repository } from 'typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';

export class RoomRepository extends BaseAbstractRepostitory<Room> implements IRoomRepository {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {
    super(roomRepository);
  }

  async createRoom(room: Partial<Room>): Promise<Room> {
    const newRoom = this.roomRepository.create(room);
    return await this.roomRepository.save(newRoom);
  }

  async findById(id: string): Promise<Room | null> {
    const room = await this.roomRepository.findOne({ where: { id: id } });
    return room;
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
