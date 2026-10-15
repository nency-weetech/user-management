import { JoinRequestRepository, Room, RoomJoinRequest, RoomMember, RoomMemberRepository, RoomRepository, User, UserRepository } from '@myapp/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Room, User, RoomMember, RoomJoinRequest])],
    providers: [RoomRepository, RoomMemberRepository, JoinRequestRepository,UserRepository,RoomsService],
    exports: [RoomsService, RoomRepository, RoomMemberRepository, JoinRequestRepository],
    controllers: [RoomsController]
})
export class RoomsModule {}
