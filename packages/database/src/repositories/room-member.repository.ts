import { InjectRepository } from '@nestjs/typeorm';
import { IRoomMemberRepository } from '../interfaces/room-member.interface';
import { RoomMember } from '../entities/roomMember.entity';
import { Repository } from 'typeorm';

export class RoomMemberRepository implements IRoomMemberRepository {
  constructor(
    @InjectRepository(RoomMember)
    private readonly roomMemberRepo: Repository<RoomMember>,
  ) {}
  async create(roomMember: Partial<RoomMember>): Promise<RoomMember>{
    const newRoomMember = this.roomMemberRepo.create(roomMember)
    return this.roomMemberRepo.save(newRoomMember);
  }

  async findByUserAndRoom(
    userId: string,
    roomId: string,
  ): Promise<RoomMember | null>{
    return this.roomMemberRepo.findOne({
        where: {
            user_id : userId,
            room_id: roomId
        }
    })
  }

  async findByRoomId(roomId: string): Promise<RoomMember[]>{
    return this.roomMemberRepo.find({where: {room_id: roomId}})
  }
}
