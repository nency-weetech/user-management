import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { BaseInterfaceRepository } from './base.interface';
interface HasId {
    id: string;
}
export declare abstract class BaseAbstractRepostitory<T extends HasId> implements BaseInterfaceRepository<T> {
    private entity;
    protected constructor(entity: Repository<T>);
    save(data: DeepPartial<T>): Promise<T>;
    saveMany(data: DeepPartial<T>[]): Promise<T[]>;
    create(data: DeepPartial<T>): T;
    createAndSave(data: DeepPartial<T>): Promise<T>;
    createMany(data: DeepPartial<T>[]): T[];
    findOneById(id: any): Promise<T | null>;
    findByCondition(filterCondition: FindOneOptions<T>): Promise<T | null>;
    findManyByCondition(filterCondition: FindManyOptions<T>): Promise<T[]>;
    findWithRelations(relations: FindManyOptions<T>): Promise<T[]>;
    findAll(options?: FindManyOptions<T>): Promise<T[]>;
    remove(data: T): Promise<T>;
    preload(entityLike: DeepPartial<T>): Promise<T | undefined>;
    findOne(options: FindOneOptions<T>): Promise<T | null>;
}
export {};
