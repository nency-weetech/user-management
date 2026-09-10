import { Repository } from 'typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { Message } from '../entities/message.entity';
import { IMessageRepo } from '../interfaces/message.interface';
export declare class MessageRepository extends BaseAbstractRepostitory<Message> implements IMessageRepo {
    private readonly messageRepo;
    constructor(messageRepo: Repository<Message>);
    createMessage(senderId: string, roomId: string, content: string): Promise<Message>;
    findByRoom(roomId: string, limit?: number, before?: Date, after?: Date): Promise<Message[]>;
}
