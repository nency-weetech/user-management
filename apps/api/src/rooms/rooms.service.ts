import {
  JoinRequestRepository,
  JoinRequestStatus,
  Room,
  RoomJoinRequest,
  RoomMember,
  RoomMemberRepository,
  RoomMemberRole,
  RoomRepository,
} from '@myapp/database';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoomDto } from './dtos/create-room-dto';
import { DataSource } from 'typeorm';

@Injectable()
export class RoomsService {
  constructor(
    private readonly datasource: DataSource,
    private readonly roomRepository: RoomRepository,
    private readonly roomMemberRepository: RoomMemberRepository,
    private readonly roomJoinRequestRepo: JoinRequestRepository,
  ) {}

  private async assertIsRoomAdmin(userId: string, roomId): Promise<void> {
    const membership = await this.roomMemberRepository.findByUserAndRoom(
      userId,
      roomId,
    );
    if (!membership) {
      throw new ForbiddenException('You are not a member of this room');
    }

    if (membership.role !== RoomMemberRole.ADMIN) {
      throw new ForbiddenException('Only room admins can perform this action');
    }
  }

  async createRoom(dto: CreateRoomDto, ownerId: string): Promise<Room> {
    return this.datasource.transaction(async (manager) => {
      const roomRepo = manager.getRepository(Room);
      const roomMemberRepo = manager.getRepository(RoomMember);

      const room = roomRepo.create({
        name: dto.name,
        description: dto.description,
        owner_id: ownerId,
      });

      const savedRoom = await roomRepo.save(room);
      const roomMember = roomMemberRepo.create({
        user_id: ownerId,
        room_id: savedRoom.id,
        role: RoomMemberRole.ADMIN,
      });

      await roomMemberRepo.save(roomMember);

      return savedRoom;
    });
  }

  async getRoomById(id: string): Promise<Room> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async getMyRooms(userId: string): Promise<Room[]> {
    return this.roomRepository.findByUserId(userId);
  }

  async requestToJoin(userId: string, roomId: string) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException('Room Not Found');
    }

    const isAlreadyMember = await this.roomMemberRepository.findByUserAndRoom(
      userId,
      roomId,
    );

    if (isAlreadyMember) {
      throw new BadRequestException('You are already a member of this room');
    }

    const hasPandingState = await this.roomJoinRequestRepo.hasPending(
      userId,
      roomId,
    );
    if (hasPandingState) {
      throw new BadRequestException(
        'You already have a pending request for this room',
      );
    }

    return this.roomJoinRequestRepo.createJoinRequest(userId, roomId);
  }

  async getPendingRequest(
    adminUserId: string,
    roomId: string,
  ): Promise<RoomJoinRequest[]> {
    await this.assertIsRoomAdmin(adminUserId, roomId)
    return this.roomJoinRequestRepo.findPendingRequestsForRoom(roomId);
  }

  async approveRequest(adminUserId: string, requestId: string): Promise<void> {
    const request = await this.roomJoinRequestRepo.findRequestById(requestId);
    if (!request) {
      throw new NotFoundException('Join request not found');
    }

    if (request.status !== JoinRequestStatus.PENDING) {
      throw new BadRequestException('This request has already been reviewed');
    }

    await this.assertIsRoomAdmin(adminUserId, request.roomId);
    await this.datasource.transaction(async (manager) => {
      await manager.update(RoomJoinRequest, requestId, {
        status: JoinRequestStatus.APPROVED,
        reviewedById: adminUserId,
        reviewedAt: new Date(),
      });

      await manager.insert(RoomMember, {
        user_id: request.userId,
        room_id: request.roomId,
        role: RoomMemberRole.MEMBER,
      });
    });
  }

  async rejectRequest(adminUserId:string, requestId: string): Promise<void>{
    const request = await this.roomJoinRequestRepo.findRequestById(requestId)
    if(!request){
      throw new NotFoundException('Join request not found');
    }
    if(request.status !== JoinRequestStatus.PENDING){
      throw new BadRequestException('This request has already been reviewed');
    }
    await this.assertIsRoomAdmin(adminUserId, request.roomId);
    await this.roomJoinRequestRepo.updateRequestStatus(requestId, JoinRequestStatus.REJECTED, adminUserId)
  }
}
