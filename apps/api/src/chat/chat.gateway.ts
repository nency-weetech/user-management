import { Inject, Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsGuard } from '../guards/ws/ws.guard';
import { In, Repository } from 'typeorm';
import {
  JoinRequestStatus,
  RoomMemberRepository,
  RoomRepository,
  User,
  UserRepository,
} from '@myapp/database';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomsService } from '../rooms/rooms.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ChatService } from './chat.service';
import Redis from 'ioredis';
import { MinioService } from '../minio/minio.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly roomMembersRepository: RoomMemberRepository,
    private readonly chatService: ChatService,
    private readonly roomRepository: RoomRepository,
    private readonly roomsService: RoomsService,
    private readonly minioService: MinioService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}
  private readonly logger = new Logger(ChatGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const userId = client.data.userId;
    if (!userId) {
      return;
    }

    const key = `online:${userId}`;

    await this.redis.srem(key, client.id);
    const remaining = await this.redis.scard(key);

    if (remaining === 0) {
      await this.redis.srem('online_users', userId);
      this.server.emit('user_offline', { userId });
    }
  }

  @SubscribeMessage('register_presence')
  async handleRegisterPresence(@ConnectedSocket() client: Socket) {
    await this.registerOnline(client);
  }

  private async registerOnline(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    const key = `online:${userId}`;
    const wasOfflinebefore = (await this.redis.scard(key)) === 0;

    await this.redis.sadd(key, client.id);
    await this.redis.expire(key, 60)
    await this.redis.sadd('online_users', userId);

    if (wasOfflinebefore) {
      this.server.emit('user_online', {
        userId,
        name: client.data.firstName,
      });
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.registerOnline(client);

    const userId = client.data.userId;
    const membership = await this.roomMembersRepository.findByUserAndRoom(
      userId,
      data.roomId,
    );

    if (membership) {
      await client.join(data.roomId);

      this.logger.log(`User ${client.data.userId} joined room ${data.roomId}`);

      client.emit('room_joined', {
        roomId: data.roomId,
        message: `Successfully joined room ${data.roomId}`,
      });

      const onlineUsersWithNames = await this.buildOnlineUsersList();
      client.emit('online_users', {
        users: onlineUsersWithNames,
      });
      return;
    }

    try {
      await this.roomsService.requestToJoin(userId, data.roomId);
      client.emit('join_request_submitted', {
        roomId: data.roomId,
        message: 'Your request to join has been sent to the room admins.',
      });
    } catch (error) {
      client.emit('join_room_error', {
        roomId: data.roomId,
        message: error.message,
      });
    }
  }

  private async buildOnlineUsersList(): Promise<
    { userId: string; name: string }[]
  > {
    const userIds = await this.redis.smembers('online_users');
    if (userIds.length === 0) return [];

    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    });

    return users.map((u) => ({ userId: u.id, name: u.firstName }));
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(data.roomId);

    this.logger.log(`User ${client.data.userId} left room ${data.roomId}`);

    client.emit('room_left', {
      roomId: data.roomId,
      message: `Successfully left room ${data.roomId}`,
    });
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      message?: string;
      fileKey?: string;
      fileName?: string;
      fileType?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const saved = await this.chatService.sendMessage(
        client.data.userId,
        data.roomId,
        data.message,
        data.fileKey,
        data.fileName,
        data.fileType,
      );

      let fileUrl = null;
      if (saved.file_key) {
        fileUrl = await this.minioService.getDownloadUrl(saved.file_key);
      }

      const messageData = {
        id: saved.id,
        senderId: saved.sender_id,
        senderName: client.data.firstName,
        roomId: saved.room_id,
        message: saved.content,
        fileUrl,
        fileName: saved.file_name,
        fileType: saved.file_type,
        created_at: saved.created_at,
      };

      this.server.to(data.roomId).emit('new_message', messageData);
    } catch (error) {
      client.emit('send_message_error', {
        roomId: data.roomId,
        message: error.message,
      });
    }
  }

  @SubscribeMessage('get_history')
  async handleHistory(
    @MessageBody() data: { roomId: string; before?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const before = data.before ? new Date(data.before) : undefined;
      const messages = await this.chatService.getHistory(
        client.data.userId,
        data.roomId,
        before,
      );
      client.emit('message_history', {
        roomId: data.roomId,
        messages: await Promise.all(
          messages.map(async (m) => ({
            id: m.id,
            senderId: m.sender_id,
            senderName: m.sender?.firstName ?? 'Unknown',
            roomId: m.room_id,
            message: m.content,
            fileUrl: m.file_key
              ? await this.minioService.getDownloadUrl(m.file_key)
              : null,
            fileName: m.file_name,
            fileType: m.file_type,
            createdAt: m.created_at,
          })),
        ),
      });
    } catch (error) {
      console.log(error);
      client.emit('get_history_error', {
        roomId: data.roomId,
        message: error.message,
      });
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('user_typing', {
      userId: client.data.userId,
      userName: client.data.firstName,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.roomId).emit('user_stopped_typing', {
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('request_upload_url')
  async handleRequestUploadUrl(
    @MessageBody() data: { roomId: string; filename: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.userId;
      // reuse the same membership check pattern as send_message
      const membership = await this.roomMembersRepository.findByUserAndRoom(
        userId,
        data.roomId,
      );
      if (!membership) {
        throw new Error('You are not a member of this room');
      }

      const fileKey = await this.minioService.generateFileKey(
        data.roomId,
        data.filename,
      );
      const uploadUrl = await this.minioService.getUplaodUrl(fileKey);

      client.emit('upload_url_ready', { fileKey, uploadUrl });
    } catch (error) {
      client.emit('upload_url_error', { message: error.message });
    }
  }

  @OnEvent('room.join_request.created')
  async handleJoinRequestCreated(payload: {
    requestId: string;
    roomId: string;
    requesterId: string;
  }) {
    const admins = await this.roomMembersRepository.findByAdminsForRoom(
      payload.roomId,
    );
    const requester = await this.userRepository.findOne({
      where: { id: payload.requesterId },
    });

    const room = await this.roomRepository.findById(payload.roomId);
    for (const admin of admins) {
      const key = `online:${admin.user_id}`;
      const adminSocketIds = await this.redis.smembers(key);
      if (adminSocketIds.length === 0) continue;

      for (const socketId of adminSocketIds) {
        this.server.to(socketId).emit('join_request_pending', {
          requestId: payload.requestId,
          roomId: payload.roomId,
          roomName: room?.name ?? 'a room',
          requesterId: payload.requesterId,
          requesterName: requester?.firstName ?? 'Someone',
        });
      }
    }
  }

  @OnEvent('room.join_request.reviewed')
  async handleJoinRequestReviewed(payload: {
    requesterId: string;
    roomId: string;
    status: JoinRequestStatus;
  }) {
    const key = `online:${payload.requesterId}`;
    const requesterSocketIds = await this.redis.smembers(key);
    if (requesterSocketIds.length === 0) return;

    const eventName =
      payload.status === JoinRequestStatus.APPROVED
        ? 'join_request_approved'
        : 'join_request_rejected';

    for (const socketId of requesterSocketIds) {
      this.server.to(socketId).emit(eventName, {
        roomId: payload.roomId,
      });
    }
  }
}
