"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const room_entity_1 = require("../entities/room.entity");
const typeorm_2 = require("typeorm");
const base_repository_1 = require("../common/base.repository");
let RoomRepository = class RoomRepository extends base_repository_1.BaseAbstractRepostitory {
    roomRepository;
    constructor(roomRepository) {
        super(roomRepository);
        this.roomRepository = roomRepository;
    }
    async createRoom(room) {
        const newRoom = this.roomRepository.create(room);
        return await this.roomRepository.save(newRoom);
    }
    async findById(id) {
        const room = await this.roomRepository.findOne({ where: { id: id } });
        return room;
    }
    async findByOwnerId(ownerId) {
        return this.roomRepository.find({ where: { owner_id: ownerId } });
    }
    async findByUserId(userId) {
        return this.roomRepository
            .createQueryBuilder('room')
            .innerJoin('room.members', 'member', 'member.user_id = :userId', {
            userId,
        })
            .getMany();
    }
};
exports.RoomRepository = RoomRepository;
exports.RoomRepository = RoomRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(room_entity_1.Room)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RoomRepository);
