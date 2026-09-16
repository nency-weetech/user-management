import { InjectRepository } from "@nestjs/typeorm";
import { BaseAbstractRepostitory } from "../common/base.repository";
import { Profile } from "../entities/profile.entity";
import { IProfile } from "../interfaces/profile.interface";
import { Repository } from "typeorm";

export class ProfileRepository extends BaseAbstractRepostitory<Profile> implements IProfile{
    constructor(@InjectRepository(Profile) private readonly profileRepo : Repository<Profile>){
        super(profileRepo);
    }

    // async updateProfile(id: string, name: string, description?: string ) : Promise<Profile>{
    //     const profile = await this.profileRepo.update(id, {name, description})
    //     return profile;
    // }
    
}