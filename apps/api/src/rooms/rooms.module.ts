import { JoinRequestRepository, Room, RoomJoinRequest, RoomMember, RoomMemberRepository, RoomRepository } from '@myapp/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Room, RoomMember, RoomJoinRequest])],
    providers: [RoomRepository, RoomMemberRepository, JoinRequestRepository ,RoomsService],
    exports: [RoomRepository, RoomMemberRepository, JoinRequestRepository],
    controllers: [RoomsController]
})
export class RoomsModule {}
