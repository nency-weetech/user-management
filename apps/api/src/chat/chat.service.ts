import {
  MessageRepository,
  RoomMemberRepository,
  RoomRepository,
} from '@myapp/database';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ChatService {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly roomMemberRepo: RoomMemberRepository,
    private readonly roomRepo: RoomRepository,
  ) {}

  private async assertIsMember(
    senderId: string,
    roomId: string,
  ): Promise<void> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const membership = await this.roomMemberRepo.findByUserAndRoom(
      senderId,
      roomId,
    );
    if (!membership) {
      throw new ForbiddenException('You are not a member of this room');
    }
  }

  async sendMessage(senderId: string, roomId: string, content: string) {
    await this.assertIsMember(senderId, roomId);
    return this.messageRepo.createMessage(senderId, roomId, content);
  }

  async getHistory(userId: string, roomId: string, before?: Date) {
    await this.assertIsMember(userId, roomId);
    const membership = await this.roomMemberRepo.findByUserAndRoom(userId, roomId)
    const messages = await this.messageRepo.findByRoom(roomId, 50, before, membership.joined_at);
    return messages.reverse();
  }
}
