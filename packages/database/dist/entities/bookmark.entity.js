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
exports.BookMarks = void 0;
const typeorm_1 = require("typeorm");
const profile_entity_1 = require("./profile.entity");
const article_entity_1 = require("./article.entity");
let BookMarks = class BookMarks {
    id;
    profile_id;
    profile;
    article_id;
    article;
    note;
    created_at;
    updated_at;
};
exports.BookMarks = BookMarks;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BookMarks.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BookMarks.prototype, "profile_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profile_entity_1.Profile, (profile) => profile.bookmarks, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'profile_id' }),
    __metadata("design:type", profile_entity_1.Profile)
], BookMarks.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BookMarks.prototype, "article_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => article_entity_1.Article, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'article_id' }),
    __metadata("design:type", article_entity_1.Article)
], BookMarks.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BookMarks.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], BookMarks.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], BookMarks.prototype, "updated_at", void 0);
exports.BookMarks = BookMarks = __decorate([
    (0, typeorm_1.Entity)('bookmarks'),
    (0, typeorm_1.Unique)(['profile_id', 'article_id'])
], BookMarks);
