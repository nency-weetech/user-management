import { Logger, UseGuards } from '@nestjs/common';
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
import { User, UserRepository } from '@myapp/database';
import { InjectRepository } from '@nestjs/typeorm';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  private readonly logger = new Logger(ChatGateway.name);

  private onlineUsers = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const userId = client.data.userId;
    if (!userId) {
      return;
    }
    const socket = this.onlineUsers.get(userId);
    if (socket) {
      socket.delete(client.id);
      if (socket.size === 0) {
        this.onlineUsers.delete(userId);
        this.server.emit('user_offline', { userId });
      }
    }
  }

  private registerOnline(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    const wasOffline = !this.onlineUsers.has(userId);
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId).add(client.id);

    if (wasOffline) {
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
    this.registerOnline(client);
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
  }

  private async buildOnlineUsersList(): Promise<
    { userId: string; name: string }[]
  > {
    const userIds = Array.from(this.onlineUsers.keys());
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
  handleMessage(
    @MessageBody() data: { roomId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const messageData = {
      senderId: client.data.userId,
      senderName: client.data.firstName,
      roomId: data.roomId,
      message: data.message,
    };

    this.server.to(data.roomId).emit('new_message', messageData);
  }
}
