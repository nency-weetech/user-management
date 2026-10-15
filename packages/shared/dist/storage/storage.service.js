"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const Minio = __importStar(require("minio"));
const REGION = process.env.MINIO_REGION ?? 'us-east-1';
let StorageService = StorageService_1 = class StorageService {
    logger = new common_1.Logger(StorageService_1.name);
    internal;
    publicClient;
    constructor() {
        const endPoint = process.env.MINIO_HOST ?? 'localhost';
        const port = Number(process.env.MINIO_PORT ?? 9000);
        const useSSL = false;
        const accessKey = process.env.MINIO_ACCESS_KEY;
        const secretKey = process.env.MINIO_SECRET_KEY;
        this.internal = new Minio.Client({
            endPoint,
            port,
            useSSL,
            accessKey,
            secretKey,
            region: REGION,
        });
        this.publicClient = new Minio.Client({
            endPoint: process.env.MINIO_PUBLIC_HOST ??
                endPoint,
            port: Number(process.env.MINIO_PUBLIC_PORT ?? port),
            useSSL: (process.env.MINIO_PUBLIC_USE_SSL ?? String(useSSL)) === 'true',
            accessKey,
            secretKey,
            region: REGION,
        });
    }
    async ensureBucket(bucket) {
        if (await this.internal.bucketExists(bucket))
            return;
        try {
            await this.internal.makeBucket(bucket, REGION);
            this.logger.log(`Bucket ${bucket} created`);
        }
        catch (err) {
            if (err?.code !== 'BucketAlreadyOwnedByYou' && err?.code !== 'BucketAlreadyExists')
                throw err;
        }
    }
    async upload(bucket, key, body, contentType) {
        return this.internal.putObject(bucket, key, body, body.length, { 'Content-Type': contentType });
    }
    async exist(bucket, key) {
        try {
            await this.internal.statObject(bucket, key);
            return true;
        }
        catch (err) {
            if (err?.code === 'NotFound' || err?.code === 'NoSuchKey')
                return false;
            throw err;
        }
    }
    presignGet(bucket, key, expiresSecond = 60, opts = {}) {
        const headers = {};
        if (opts.filename) {
            const safe = opts.filename.replace(/["\\\r\n]/g, '_');
            headers['response-content-disposition'] = `attachment; filename="${safe}"`;
        }
        if (opts.contentType) {
            headers['response-content-type'] = opts.contentType;
        }
        return this.publicClient.presignedGetObject(bucket, key, expiresSecond, headers);
    }
    presignPut(bucket, key, expiresSecond = 300) {
        return this.publicClient.presignedPutObject(bucket, key, expiresSecond);
    }
    async remove(bucket, key) {
        await this.internal.removeObject(bucket, key);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map