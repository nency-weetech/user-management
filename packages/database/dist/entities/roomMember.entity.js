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
exports.RoomMember = void 0;
const typeorm_1 = require("typeorm");
const room_entity_1 = require("./room.entity");
const user_entity_1 = require("./user.entity");
const room_member_role_enum_1 = require("../enums/room-member-role.enum");
let RoomMember = class RoomMember {
    id;
    user_id;
    user;
    room_id;
    room;
    role;
    joined_at;
};
exports.RoomMember = RoomMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoomMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoomMember.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.room_memberships, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], RoomMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoomMember.prototype, "room_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => room_entity_1.Room, (room) => room.members, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'room_id' }),
    __metadata("design:type", room_entity_1.Room)
], RoomMember.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: room_member_role_enum_1.RoomMemberRole,
        default: room_member_role_enum_1.RoomMemberRole.MEMBER,
    }),
    __metadata("design:type", String)
], RoomMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], RoomMember.prototype, "joined_at", void 0);
exports.RoomMember = RoomMember = __decorate([
    (0, typeorm_1.Entity)('room_members'),
    (0, typeorm_1.Unique)('UQ_ROOM_MEMBER_USER_ROOM', ['user_id', 'room_id']),
    (0, typeorm_1.Index)('IDX_ROOM_MEMBERS_ROOM_ID', ['room_id']),
    (0, typeorm_1.Index)('IDX_ROOM_MEMBERS_USER_ID', ['user_id'])
], RoomMember);
