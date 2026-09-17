import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PLAN_CONFIG, Profile, ProfileRepository, User, UserPlanRepository } from '@myapp/database';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly dataSource : DataSource,
    private readonly userPlanRepo : UserPlanRepository,
  ) {}

  async create(createProfileDto: CreateProfileDto, userId: string) : Promise<Profile>{
    const existing = await this.profileRepo.countByUserId(userId);
    const userPlan = await this.userPlanRepo.findByUserId(userId);
    if (!userPlan) {
        throw new NotFoundException('User plan not found');
    }
    const config = PLAN_CONFIG[userPlan.plan] 

    if(config.profileLimit !== null){
      const currentCount = await this.profileRepo.countByUserId(userId)

      if (currentCount >= config.profileLimit) {
      throw new ForbiddenException(
        `Profile limit reached (${config.profileLimit}). Upgrade your plan to create more profiles.`,
      );
    }
    }
    const profile = this.profileRepo.create({
      user_id: userId,
      name: createProfileDto.name,
      description: createProfileDto.description,
      is_default: existing === 0
    });
    return this.profileRepo.save(profile);
  }

  async findAllProfile(userId: string): Promise<Profile[]> {
    const profiles = await this.profileRepo.findAllProfile(userId)
    return profiles;
  }

  async findOne(id: string) : Promise<Profile> {
    const profile = await this.profileRepo.findOne({where: {id}})
    return profile;
  }

  async findDefaultProfile(userId: string){
    return await this.profileRepo.findOne({where : {user_id: userId, is_default: true}});
  }

  async update(userId: string, id: string, updateProfileDto: UpdateProfileDto) : Promise<Profile>{
    const profile = await this.profileRepo.findOne({where: {id: id}});
    if(!profile)
      throw new NotFoundException('Profile Not found')
    
    if(profile.user_id !== userId){
      throw new ForbiddenException('Not your profile');
    }

    Object.assign(profile, updateProfileDto);
    return this.profileRepo.save(profile);
  }

  async updateIsDefault(userId: string, profileId: string){
    const target = await this.profileRepo.findOne({where: {id: profileId}});

    if(!target)
      throw new NotFoundException('Profile Not found')
    
    if(target.user_id !== userId){
      throw new ForbiddenException('Not your profile');
    }
    if(target.is_default){
      return target;
    }

  return this.dataSource.transaction(async(manager) => {
    await manager.update(Profile, {user_id: userId, is_default: true}, { is_default: false })
    await manager.update(Profile, {id: profileId}, {is_default: true});
    return manager.findOneOrFail(Profile, {where: {id: profileId}})
  })
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
