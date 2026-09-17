import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkRepository, BookMarks, UserPlan, UserPlanRepository, UserUsage, UserUsageRepository } from '@myapp/database';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([BookMarks, UserPlan, UserUsage])],
  controllers: [BookmarkController],  
  providers: [BookmarkService, BookmarkRepository, UserPlanRepository, UserUsageRepository],
})
export class BookmarkModule {}
