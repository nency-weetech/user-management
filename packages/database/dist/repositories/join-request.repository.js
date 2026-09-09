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
exports.JoinRequestRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const room_join_request_entity_1 = require("../entities/room-join-request.entity");
const typeorm_2 = require("typeorm");
const join_request_status_dto_1 = require("../enums/join-request-status.dto");
let JoinRequestRepository = class JoinRequestRepository {
    joinRequestRepo;
    constructor(joinRequestRepo) {
        this.joinRequestRepo = joinRequestRepo;
    }
    async createJoinRequest(userId, roomId) {
        const request = this.joinRequestRepo.create({ userId, roomId });
        return this.joinRequestRepo.save(request);
    }
    async hasPending(userId, roomId) {
        const count = await this.joinRequestRepo.count({
            where: { userId, roomId, status: join_request_status_dto_1.JoinRequestStatus.PENDING }
        });
        return count > 0;
    }
    async findPendingRequestsForRoom(roomId) {
        return this.joinRequestRepo.find({
            where: { roomId, status: join_request_status_dto_1.JoinRequestStatus.PENDING },
            relations: { user: true },
            order: { requestedAt: 'ASC' },
        });
    }
    async findRequestById(requestId) {
        return this.joinRequestRepo.findOne({
            where: { id: requestId },
            relations: { room: true },
        });
    }
    async updateRequestStatus(requestId, status, reviewedById) {
        await this.joinRequestRepo.update(requestId, {
            status,
            reviewedById,
            reviewedAt: new Date(),
        });
    }
    async findAllPendingForUser(userId) {
        return this.joinRequestRepo.find({
            where: { userId, status: join_request_status_dto_1.JoinRequestStatus.PENDING },
        });
    }
};
exports.JoinRequestRepository = JoinRequestRepository;
exports.JoinRequestRepository = JoinRequestRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(room_join_request_entity_1.RoomJoinRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], JoinRequestRepository);
