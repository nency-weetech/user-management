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
exports.PdfStorage = void 0;
const common_1 = require("@nestjs/common");
const storage_service_1 = require("../storage/storage.service");
let PdfStorage = class PdfStorage {
    storageService;
    bucket = process.env.PDF_BUCKET;
    constructor(storageService) {
        this.storageService = storageService;
        const bucket = process.env.PDF_BUCKET;
        if (!bucket)
            throw new Error('PDF_BUCKET is not set');
        this.bucket = bucket;
    }
    async onModuleInit() {
        return this.storageService.ensureBucket(this.bucket);
    }
    upload(key, pdf) {
        return this.storageService.upload(this.bucket, key, pdf, 'application/octen-stream');
    }
    async exists(key) {
        return this.storageService.exist(this.bucket, key);
    }
    async presignGet(key, expirySecond = 60, filename = 'invoice.pdf') {
        return this.storageService.presignGet(this.bucket, key, expirySecond, {
            filename,
            contentType: 'application/pdf'
        });
    }
    async remove(key) {
        await this.storageService.remove(this.bucket, key);
    }
};
exports.PdfStorage = PdfStorage;
exports.PdfStorage = PdfStorage = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], PdfStorage);
//# sourceMappingURL=pdf.storage.service.js.map