import { Between, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { Message } from '../entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IMessageRepo } from '../interfaces/message.interface';

export class MessageRepository
  extends BaseAbstractRepostitory<Message>
  implements IMessageRepo
{
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {
    super(messageRepo);
  }

  async createMessage(
    senderId: string,
    roomId: string,
    content: string,
  ): Promise<Message> {
    const message = this.messageRepo.create({
      sender_id: senderId,
      room_id: roomId,
      content,
    });
    return this.messageRepo.save(message);
  }

  async findByRoom(
    roomId: string,
    limit = 50,
    before?: Date,
    after?: Date, // NEW
  ): Promise<Message[]> {
    const where: any = { room_id: roomId };

    if (before && after) {
      where.created_at = Between(after, before);
    } else if (before) {
      where.created_at = LessThan(before);
    } else if (after) {
      where.created_at = MoreThanOrEqual(after);
    }

    return this.messageRepo.find({
      where,
      relations: { sender: true },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
