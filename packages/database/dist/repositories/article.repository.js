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
exports.ArticleRepository = void 0;
const base_repository_1 = require("../common/base.repository");
const article_entity_1 = require("../entities/article.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let ArticleRepository = class ArticleRepository extends base_repository_1.BaseAbstractRepostitory {
    articleRepository;
    constructor(articleRepository) {
        super(articleRepository);
        this.articleRepository = articleRepository;
    }
    findByExternalId(externalId) {
        return this.articleRepository.findOne({ where: { externalId } });
    }
    async upsertArticle(data) {
        await this.articleRepository.upsert(data, ['externalId']);
        return this.findByExternalId(data.externalId);
    }
    async findAllPaginated(page, limit, category) {
        const skip = (page - 1) * limit;
        const query = this.articleRepository.createQueryBuilder('articles');
        if (category) {
            query.andWhere('articles.catagory = :category', { category });
        }
        query.orderBy('articles.publishDated', 'DESC').skip(skip).take(limit);
        return query.getManyAndCount();
    }
    async countBySentimentRange(min, max) {
        return this.articleRepository.count({
            where: { sentiment: (0, typeorm_2.Between)(min, max) }
        });
    }
};
exports.ArticleRepository = ArticleRepository;
exports.ArticleRepository = ArticleRepository = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ArticleRepository);
