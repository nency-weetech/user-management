import { forwardRef, Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile, ProfileRepository, UserPlan, UserPlanRepository } from '@myapp/database';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, UserPlan]), forwardRef(() => AuthModule)],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, UserPlanRepository],
  exports: [ProfileService]
})
export class ProfileModule {}
