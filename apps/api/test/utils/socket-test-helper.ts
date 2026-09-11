import { INestApplication } from '@nestjs/common';
import Request from 'supertest';
import { Socket, io } from 'socket.io-client';
import { UsersService } from '../../src/users/users.service';
import bcrypt from 'bcrypt';
import { RoomMemberRepository, UserRole } from '@myapp/database';
import { RoomsService } from '../../src/rooms/rooms.service';
export function waitForEvent<T = any>(
  socket: Socket,
  eventName: string,
): Promise<T> {
  return new Promise((resolve) => {
    socket.once(eventName, (data: T) => resolve(data));
  });
}

export async function createUserAndGetToken(
  app: INestApplication,
  email: string,
  overrides: Partial<any> = {},
): Promise<{ userId: string; accessToken: string }> {
  const userservice = app.get<UsersService>(UsersService);
  const plainPassword = 'password@123';
  const hashPassword = await bcrypt.hash(plainPassword, 10);

  const user = await userservice.create({
    email,
    password: hashPassword,
    firstName: overrides.firstName ?? 'Test',
    lastName: overrides.lastName ?? 'User',
    isEmailVerified: true,
    isActive: true,
    role: UserRole.USER,
    ...overrides,
  });

  const res = await Request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: email, password: plainPassword })
    .expect(201);

  return { userId: user.id, accessToken: res.body.accessToken };
}

export function connectSocket(baseUrl: string, token: string): Socket {
  return io(baseUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: false,
  });
}

export async function createTestRoom(
  app: INestApplication,
  ownerId: string,
  name: string,
): Promise<{ id: string; name: string }> {
  const roomService = app.get<RoomsService>(RoomsService);
  const room = await roomService.createRoom({ name, description: '' }, ownerId);
  return { id: room.id, name: room.name }
}

export async function addTestMember(app:INestApplication, userId: string, roomId: string): Promise<void>{
    const roomMemberRepo = app.get<RoomMemberRepository>(RoomMemberRepository);
    roomMemberRepo.createAndSave({user_id: userId, room_id: roomId})
}
