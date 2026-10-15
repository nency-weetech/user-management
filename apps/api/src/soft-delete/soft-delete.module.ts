import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SoftDeleteService } from './soft-delete.service';
import { DeletionCleanupService } from './deletion-cleanup.service';
import { DeletionListenerService } from './deletion-listener.service';

@Module({
    imports: [UsersModule],
    providers: [SoftDeleteService, DeletionCleanupService, DeletionListenerService],
    exports: [SoftDeleteService]
})
export class SoftDeleteModule {}
