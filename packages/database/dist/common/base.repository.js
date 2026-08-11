"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAbstractRepostitory = void 0;
class BaseAbstractRepostitory {
    entity;
    constructor(entity) {
        this.entity = entity;
    }
    async save(data) {
        return await this.entity.save(data);
    }
    async saveMany(data) {
        return this.entity.save(data);
    }
    create(data) {
        return this.entity.create(data);
    }
    createAndSave(data) {
        const createdData = this.entity.create(data);
        return this.entity.save(createdData);
    }
    createMany(data) {
        return this.entity.create(data);
    }
    async findOneById(id) {
        const options = {
            id: id
        };
        return await this.entity.findOneBy(options);
    }
    async findByCondition(filterCondition) {
        return await this.entity.findOne(filterCondition);
    }
    async findWithRelations(relations) {
        return await this.entity.find(relations);
    }
    async findAll(options) {
        return await this.entity.find(options);
    }
    async remove(data) {
        return await this.entity.remove(data);
    }
    async preload(entityLike) {
        return await this.entity.preload(entityLike);
    }
    async findOne(options) {
        return this.entity.findOne(options);
    }
}
exports.BaseAbstractRepostitory = BaseAbstractRepostitory;
