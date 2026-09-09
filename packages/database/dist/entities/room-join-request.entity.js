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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomJoinRequest = void 0;
const typeorm_1 = require("typeorm");
const room_entity_1 = require("./room.entity");
const user_entity_1 = require("./user.entity");
const join_request_status_dto_1 = require("../enums/join-request-status.dto");
let RoomJoinRequest = class RoomJoinRequest {
    id;
    userId;
    user;
    roomId;
    room;
    status;
    requestedAt;
    reviewedById;
    reviewedBy;
    reviewedAt;
};
exports.RoomJoinRequest = RoomJoinRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoomJoinRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoomJoinRequest.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], RoomJoinRequest.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoomJoinRequest.prototype, "roomId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => room_entity_1.Room, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'roomId' }),
    __metadata("design:type", room_entity_1.Room)
], RoomJoinRequest.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: join_request_status_dto_1.JoinRequestStatus,
        default: join_request_status_dto_1.JoinRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], RoomJoinRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], RoomJoinRequest.prototype, "requestedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RoomJoinRequest.prototype, "reviewedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewedById' }),
    __metadata("design:type", user_entity_1.User)
], RoomJoinRequest.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], RoomJoinRequest.prototype, "reviewedAt", void 0);
exports.RoomJoinRequest = RoomJoinRequest = __decorate([
    (0, typeorm_1.Entity)('room_join_requests'),
    (0, typeorm_1.Index)('UQ_pending_request_per_user_room', ['userId', 'roomId'], {
        unique: true,
        where: `"status" = 'PENDING'`,
    })
], RoomJoinRequest);
