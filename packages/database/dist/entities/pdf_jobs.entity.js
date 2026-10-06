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
exports.PdfJob = exports.PdfJobStatus = void 0;
const typeorm_1 = require("typeorm");
var PdfJobStatus;
(function (PdfJobStatus) {
    PdfJobStatus["QUEUED"] = "queued";
    PdfJobStatus["PROCESSING"] = "processing";
    PdfJobStatus["READY"] = "ready";
    PdfJobStatus["FAILED"] = "failed";
    PdfJobStatus["EXPIRED"] = "expired";
})(PdfJobStatus || (exports.PdfJobStatus = PdfJobStatus = {}));
let PdfJob = class PdfJob {
    id;
    owner_id;
    status;
    object_key;
    filename;
    error;
    expires_at;
    created_at;
    updated_at;
};
exports.PdfJob = PdfJob;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PdfJob.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PdfJob.prototype, "owner_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: PdfJobStatus.QUEUED }),
    __metadata("design:type", String)
], PdfJob.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PdfJob.prototype, "object_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], PdfJob.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PdfJob.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], PdfJob.prototype, "expires_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], PdfJob.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], PdfJob.prototype, "updated_at", void 0);
exports.PdfJob = PdfJob = __decorate([
    (0, typeorm_1.Entity)('pdf_jobs'),
    (0, typeorm_1.Index)('pdf_jobs_owner_status_idx', ['owner_id', 'status']),
    (0, typeorm_1.Index)('pdf_jobs_expires_idx', ['expires_at'], { where: `"status" = 'ready'` })
], PdfJob);
