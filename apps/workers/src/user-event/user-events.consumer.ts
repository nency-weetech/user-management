import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Consumer, KafkaMessage, logLevel } from 'kafkajs';
import { ParsedEvent } from '@myapp/shared';
import { UserEventHandler } from './user-event.handler';

@Injectable()
export class UserEventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(UserEventConsumer.name);
  private readonly consumer: Consumer;

    constructor(private readonly eventHandler : UserEventHandler) {
        const kafka = new Kafka({
        clientId: 'worker',
        brokers: [process.env.KAFKA_BROKER!],
        logLevel: logLevel.WARN,
        });
        this.consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID! });
    }

  async onModuleInit() {
    await this.consumer.connect();

    this.consumer.on(this.consumer.events.GROUP_JOIN, (e) =>
      this.log.log(`group joined, partitions=${JSON.stringify(e.payload.memberAssignment)}`),
    );

    await this.consumer.subscribe({
      topic: process.env.KAFKA_TOPIC!,
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const evt = ParsedEvent(topic, partition, message);
        console.log(evt)
        await this.eventHandler.handler(evt);
        this.log.log(`done ${evt.eventId} user=${evt.payload.userId} email=${evt.payload.email}`);
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}