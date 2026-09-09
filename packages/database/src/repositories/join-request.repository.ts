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
    const request = this.joinRequestRepo.create({ userId, roomId });
    return this.joinRequestRepo.save(request);
  }

  async hasPending(userId: string, roomId: string): Promise<boolean>{
    const count = await this.joinRequestRepo.count({
        where: {userId, roomId, status: JoinRequestStatus.PENDING}
    })
    return count > 0;
  }

  async findPendingRequestsForRoom(roomId: string): Promise<RoomJoinRequest[]> {
    return this.joinRequestRepo.find({
      where: { roomId, status: JoinRequestStatus.PENDING },
      relations: {user : true},
      order: { requestedAt: 'ASC' },
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
      reviewedById,
      reviewedAt: new Date(),
    });
  }

  
}
