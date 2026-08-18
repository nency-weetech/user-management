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
exports.NewsFetchLog = exports.fetchTrigger = void 0;
const user_entity_1 = require("./user.entity");
const typeorm_1 = require("typeorm");
var fetchTrigger;
(function (fetchTrigger) {
    fetchTrigger["CORN"] = "corn";
    fetchTrigger["ADMIN"] = "admin";
})(fetchTrigger || (exports.fetchTrigger = fetchTrigger = {}));
let NewsFetchLog = class NewsFetchLog {
    id;
    query;
    articlesFetched;
    triggeredBy;
    triggeredByUserId;
    triggeredByUser;
    success;
    errorMessage;
    durationMs;
    createdAt;
    updatedAt;
};
exports.NewsFetchLog = NewsFetchLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NewsFetchLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NewsFetchLog.prototype, "query", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], NewsFetchLog.prototype, "articlesFetched", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: fetchTrigger }),
    __metadata("design:type", String)
], NewsFetchLog.prototype, "triggeredBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NewsFetchLog.prototype, "triggeredByUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'triggeredByUserId' }),
    __metadata("design:type", user_entity_1.User)
], NewsFetchLog.prototype, "triggeredByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NewsFetchLog.prototype, "success", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], NewsFetchLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], NewsFetchLog.prototype, "durationMs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], NewsFetchLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], NewsFetchLog.prototype, "updatedAt", void 0);
exports.NewsFetchLog = NewsFetchLog = __decorate([
    (0, typeorm_1.Entity)('news-fetch-log')
], NewsFetchLog);
