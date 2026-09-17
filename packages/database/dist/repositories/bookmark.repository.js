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
exports.BookmarkRepository = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../common/base.repository");
const bookmark_entity_1 = require("../entities/bookmark.entity");
const typeorm_2 = require("typeorm");
let BookmarkRepository = class BookmarkRepository extends base_repository_1.BaseAbstractRepostitory {
    bookmarkrepo;
    constructor(bookmarkrepo) {
        super(bookmarkrepo);
        this.bookmarkrepo = bookmarkrepo;
    }
    async findByProfileId(profileId) {
        return await this.bookmarkrepo.find({ where: { profile_id: profileId } });
    }
    async findByProfileAndArticle(profileId, articleId) {
        return await this.bookmarkrepo.findOne({
            where: { profile_id: profileId, article_id: articleId },
        });
    }
    async findOneById(bookmarkId) {
        return await this.bookmarkrepo.findOne({
            where: { id: bookmarkId },
            relations: { article: true }
        });
    }
    async findAllBookmark(profileId) {
        return await this.bookmarkrepo.find({
            where: {
                profile_id: profileId
            },
            relations: {
                article: true
            },
            order: {
                created_at: 'DESC'
            }
        });
    }
    async countByProfileId(profileId) {
        return this.bookmarkrepo.count({ where: { profile_id: profileId } });
    }
};
exports.BookmarkRepository = BookmarkRepository;
exports.BookmarkRepository = BookmarkRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(bookmark_entity_1.BookMarks)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BookmarkRepository);
