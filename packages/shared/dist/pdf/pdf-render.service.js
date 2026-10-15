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
var PdfRenderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfRenderService = void 0;
const common_1 = require("@nestjs/common");
const browser_service_1 = require("./browser.service");
let PdfRenderService = PdfRenderService_1 = class PdfRenderService {
    browser;
    logger = new common_1.Logger(PdfRenderService_1.name);
    constructor(browser) {
        this.browser = browser;
    }
    async render(html) {
        const browser = await this.browser.get();
        const page = await browser.newPage();
        let blocked = 0;
        try {
            await page.setJavaScriptEnabled(false);
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const url = req.url();
                if (url.startsWith('data:') || url.startsWith('about:')) {
                    req.continue().catch(() => undefined);
                }
                else {
                    blocked++;
                    req.abort('blockedbyclient').catch(() => undefined);
                }
            });
            page.setDefaultTimeout(15_000);
            await page.setContent(html, { waitUntil: 'load' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: 0, right: 0, bottom: 0, left: 0 }
            });
            if (blocked > 0)
                this.logger.warn(`Blocked ${blocked} external request(s) while rendering`);
            return Buffer.from(pdf);
        }
        catch (error) {
            await page.close().catch(() => undefined);
        }
    }
};
exports.PdfRenderService = PdfRenderService;
exports.PdfRenderService = PdfRenderService = PdfRenderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [browser_service_1.BrowserService])
], PdfRenderService);
//# sourceMappingURL=pdf-render.service.js.map