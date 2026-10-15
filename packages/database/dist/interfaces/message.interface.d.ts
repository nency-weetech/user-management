import { BaseInterfaceRepository } from '../common/base.interface';
import { Message } from '../entities/message.entity';
export interface IMessageRepo extends BaseInterfaceRepository<Message> {
    createMessage(senderId: string, roomId: string, content: string): Promise<Message>;
    findByRoom(roomId: string, limit: 50, before?: Date): Promise<Message[]>;
}
