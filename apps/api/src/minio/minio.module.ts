import { Module } from '@nestjs/common';
import { ChatStorage } from './minio.service';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from '@myapp/shared';


@Module({
  imports: [ConfigModule],
  providers: [ChatStorage, StorageService],
  exports: [ChatStorage],
  controllers: []
})
export class MinioModule {}
