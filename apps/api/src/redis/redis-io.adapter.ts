import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(private app: INestApplication){
    super(app)
  }

  async connectToRedis(): Promise<void>{
    const existingClient = this.app.get<Redis>('REDIS_CLIENT');

    const pubClient = existingClient.duplicate();
    const subClient = existingClient.duplicate();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any) {
      const server = super.createIOServer(port, options);
      server.adapter(this.adapterConstructor)
      return server;
  }
}
