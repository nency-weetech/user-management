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
exports.RoomMemberRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const roomMember_entity_1 = require("../entities/roomMember.entity");
const typeorm_2 = require("typeorm");
const room_member_role_enum_1 = require("../enums/room-member-role.enum");
const base_repository_1 = require("../common/base.repository");
let RoomMemberRepository = class RoomMemberRepository extends base_repository_1.BaseAbstractRepostitory {
    roomMemberRepo;
    constructor(roomMemberRepo) {
        super(roomMemberRepo);
        this.roomMemberRepo = roomMemberRepo;
    }
    async createRoomMember(roomMember) {
        const newRoomMember = this.roomMemberRepo.create(roomMember);
        return this.roomMemberRepo.save(newRoomMember);
    }
    async findByUserAndRoom(userId, roomId) {
        return this.roomMemberRepo.findOne({
            where: {
                user_id: userId,
                room_id: roomId
            }
        });
    }
    async findByRoomId(roomId) {
        return this.roomMemberRepo.find({ where: { room_id: roomId } });
    }
    async findByAdminsForRoom(roomId) {
        return this.roomMemberRepo.find({
            where: { room_id: roomId, role: room_member_role_enum_1.RoomMemberRole.ADMIN }
        });
    }
};
exports.RoomMemberRepository = RoomMemberRepository;
exports.RoomMemberRepository = RoomMemberRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(roomMember_entity_1.RoomMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RoomMemberRepository);
