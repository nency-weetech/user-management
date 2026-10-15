import { InjectRepository } from '@nestjs/typeorm';
import { RoomJoinRequest } from '../entities/room-join-request.entity';
import { JoinRequestInterface } from '../interfaces/join-request.interface';
import { Repository } from 'typeorm';
import { JoinRequestStatus } from '../enums/join-request-status.dto';

export class JoinRequestRepository implements JoinRequestInterface {
  constructor(
    @InjectRepository(RoomJoinRequest)
    private joinRequestRepo: Repository<RoomJoinRequest>,
  ) {}

  async createJoinRequest(
    userId: string,
    roomId: string,
  ): Promise<RoomJoinRequest> {
    const request = this.joinRequestRepo.create({ user_id: userId, room_id: roomId });
    return this.joinRequestRepo.save(request);
  }

  async hasPending(userId: string, roomId: string): Promise<boolean>{
    const count = await this.joinRequestRepo.count({
        where: {user_id: userId, room_id : roomId, status: JoinRequestStatus.PENDING}
    })
    return count > 0;
  }

  async findPendingRequestsForRoom(roomId: string): Promise<RoomJoinRequest[]> {
    return this.joinRequestRepo.find({
      where: { room_id: roomId, status: JoinRequestStatus.PENDING },
      relations: {user : true},
      order: { requested_at: 'ASC' },
    });
  }

  async findRequestById(requestId: string): Promise<RoomJoinRequest | null> {
    return this.joinRequestRepo.findOne({
      where: { id: requestId },
      relations: {room : true},
    });
  }

  async updateRequestStatus(
    requestId: string,
    status: JoinRequestStatus,
    reviewedById: string,
  ): Promise<void> {
    await this.joinRequestRepo.update(requestId, {
      status,
      reviewed_by_id: reviewedById,
      reviewed_at: new Date(),
    });
  }

  async findAllPendingForUser(userId: string): Promise<RoomJoinRequest[]> {
  return this.joinRequestRepo.find({
    where: { user_id : userId, status: JoinRequestStatus.PENDING },
  });
}
}
