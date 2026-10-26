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
import { DataSource } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    private readonly ds : DataSource,
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

  async sendMessage(
    senderId: string,
    roomId: string,
    content?: string,
    fileKey?: string,
    fileName?: string,
    fileType?: string,
  ) {
    await this.assertIsMember(senderId, roomId);
    const text = content?.trim() || undefined;

    if (!content && !fileKey) {
      throw new Error('Message must have text or an attachment');
    }

    return this.ds.transaction(async (manager) => {
      const saved = await this.messageRepo.createMessage(
        senderId,
        roomId,
        content,
        fileKey,
        fileName,
        fileType,
      );
     
      const outbox = await manager.save(
        await manager.create('outbox', {
          aggregate_type: 'chat_message',
          aggregate_id: roomId,
          event_type: 'chat_message.created.v1',
          payload: {
            messageId: saved.id,
            roomId,
            senderId,
            content: text ?? null,
            fileKey: fileKey ?? null,
            fileName: fileName ?? null,
            fileType: fileType ?? null,
            createdAt: saved.created_at.toISOString(),
          },
          trace_id: null,
        }),
      );
      return saved;
    });
  }

  async getHistory(userId: string, roomId: string, before?: Date) {
    await this.assertIsMember(userId, roomId);
    const membership = await this.roomMemberRepo.findByUserAndRoom(
      userId,
      roomId,
    );
    const messages = await this.messageRepo.findByRoom(
      roomId,
      50,
      before,
      membership.joined_at,
    );
    return messages.reverse();
  }
}


