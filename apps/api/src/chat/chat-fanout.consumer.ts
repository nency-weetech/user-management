import { parseChatEvent, isPoison } from '@myapp/shared';
import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Consumer, Kafka, logLevel } from 'kafkajs';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatFanoutConsumer implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly log = new Logger(ChatFanoutConsumer.name);
  private readonly consumer: Consumer;
  private readonly maxAgeMs = 60_000;

  constructor(private readonly gateway: ChatGateway) {
    const kafka = new Kafka({
      clientId: 'chat-gateway',
      brokers: [process.env.KAFKA_BROKER!],
      logLevel: logLevel.WARN,
    });
    this.consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID! });
  }

  async onApplicationBootstrap() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: process.env.KAFKA_TOPIC!, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ partition, message }) => {
        try {
          const evt = parseChatEvent(message);

          const age = Date.now() - Number(message.timestamp);
          if (age > this.maxAgeMs) {
            this.log.warn(`dropped stale p=${partition} offset=${message.offset} age=${age}ms`);
            return;
          }

          await this.gateway.broadcast(evt);
          this.log.log(`broadcast p=${partition} offset=${message.offset} id=${evt.messageId}`);
        } catch (e) {
          if (isPoison(e)) {
            this.log.error(`poison skipped p=${partition} offset=${message.offset}: ${(e as Error).message}`);
            return;
          }
          throw e;
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}