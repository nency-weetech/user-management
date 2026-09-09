import { InjectRepository } from '@nestjs/typeorm';
import { IRoomMemberRepository } from '../interfaces/room-member.interface';
import { RoomMember } from '../entities/roomMember.entity';
import { Repository } from 'typeorm';
import { RoomMemberRole } from '../enums/room-member-role.enum';
import { BaseAbstractRepostitory } from '../common/base.repository';

export class RoomMemberRepository  extends BaseAbstractRepostitory<RoomMember>implements IRoomMemberRepository {
  constructor(
    @InjectRepository(RoomMember)
    private readonly roomMemberRepo: Repository<RoomMember>,
  ) {
    super(roomMemberRepo)
  }
  async createRoomMember(roomMember: Partial<RoomMember>): Promise<RoomMember>{
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

  async findByAdminsForRoom(roomId: string): Promise<RoomMember[]>{
    return this.roomMemberRepo.find({
      where : {room_id: roomId, role: RoomMemberRole.ADMIN}
    })
  }
}
