import { BaseAbstractRepostitory } from "../common/base.repository";
import { Profile } from "../entities/profile.entity";
import { IProfile } from "../interfaces/profile.interface";
import { Repository } from "typeorm";
export declare class ProfileRepository extends BaseAbstractRepostitory<Profile> implements IProfile {
    private readonly profileRepo;
    constructor(profileRepo: Repository<Profile>);
}
