import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { WsGuard } from "../guards/ws/ws.guard";
import { Message, MessageRepository, RoomMember, RoomMemberRepository, User, UserRepository } from "@myapp/database";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoomsModule } from "../rooms/rooms.module";
import { ChatService } from "./chat.service";
import { MinioModule } from "../minio/minio.module";

@Module({
    imports: [TypeOrmModule.forFeature([User, Message]), RoomsModule, MinioModule],
    providers: [ChatService, ChatGateway,UserRepository, MessageRepository, WsGuard],
    exports: [ChatService]
})

export class ChatModule {}