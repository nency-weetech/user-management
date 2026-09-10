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
exports.MessageRepository = void 0;
const typeorm_1 = require("typeorm");
const base_repository_1 = require("../common/base.repository");
const message_entity_1 = require("../entities/message.entity");
const typeorm_2 = require("@nestjs/typeorm");
let MessageRepository = class MessageRepository extends base_repository_1.BaseAbstractRepostitory {
    messageRepo;
    constructor(messageRepo) {
        super(messageRepo);
        this.messageRepo = messageRepo;
    }
    async createMessage(senderId, roomId, content) {
        const message = this.messageRepo.create({
            sender_id: senderId,
            room_id: roomId,
            content,
        });
        return this.messageRepo.save(message);
    }
    async findByRoom(roomId, limit = 50, before, after) {
        const where = { room_id: roomId };
        if (before && after) {
            where.created_at = (0, typeorm_1.Between)(after, before);
        }
        else if (before) {
            where.created_at = (0, typeorm_1.LessThan)(before);
        }
        else if (after) {
            where.created_at = (0, typeorm_1.MoreThanOrEqual)(after);
        }
        return this.messageRepo.find({
            where,
            relations: { sender: true },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    __param(0, (0, typeorm_2.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], MessageRepository);
