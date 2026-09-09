import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { WsGuard } from "../guards/ws/ws.guard";
import { RoomMember, RoomMemberRepository, User, UserRepository } from "@myapp/database";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoomsModule } from "../rooms/rooms.module";

@Module({
    imports: [TypeOrmModule.forFeature([User]), RoomsModule],
    providers: [ChatGateway,UserRepository, WsGuard]
})

export class ChatModule {}