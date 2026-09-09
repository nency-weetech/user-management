import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { WsGuard } from "../guards/ws/ws.guard";
import { User, UserRepository } from "@myapp/database";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [ChatGateway,UserRepository, WsGuard]
})

export class ChatModule {}