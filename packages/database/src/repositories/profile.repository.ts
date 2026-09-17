import { InjectRepository } from "@nestjs/typeorm";
import { BaseAbstractRepostitory } from "../common/base.repository";
import { Profile } from "../entities/profile.entity";
import { IProfile } from "../interfaces/profile.interface";
import { FindManyOptions, Repository } from "typeorm";

export class ProfileRepository extends BaseAbstractRepostitory<Profile> implements IProfile{
    constructor(@InjectRepository(Profile) private readonly profileRepo : Repository<Profile>){
        super(profileRepo);
    }

    async countByUserId(userId: string) : Promise<Number>{
        const user = this.profileRepo.count({where : {user_id: userId}})
        return user;
    }

    async findAllProfile(userId: string): Promise<Profile[]> {
        return await this.profileRepo.find({where : {user_id: userId}})
    }
}