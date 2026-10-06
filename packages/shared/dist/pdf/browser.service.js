"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BrowserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer_1 = __importDefault(require("puppeteer"));
const with_timeout_1 = require("./with-timeout");
let BrowserService = BrowserService_1 = class BrowserService {
    logger = new common_1.Logger(BrowserService_1.name);
    browser;
    launching;
    async get() {
        if (this.browser && this.isUp(this.browser))
            return this.browser;
        if (!this.launching) {
            this.launching = this.launch().finally(() => (this.launching = undefined));
        }
        return this.launching;
    }
    async isUp(b) {
        const x = b;
        return typeof x.connected === 'boolean' ? x.connected : x.isConnected();
    }
    async launch() {
        const args = ['--disable-dev-shm-usage', 'disable-gpu'];
        if (process.env.PUPPETEER_NO_SANDBOX === 'true') {
            args.push('--no-sandbox', '--disable-setuid-sandbox');
        }
        const browser = await puppeteer_1.default.launch({ headless: true, args });
        browser.on('disconnected', () => {
            this.logger.warn('Chrome disconnect');
            if (this.browser === browser)
                this.browser = undefined;
            const proc = browser.process();
            if (proc && proc.exitCode === null && !proc.killed)
                proc.kill('SIGKILL');
        });
        this.browser = browser;
        this.logger.log(`chrome launched (pid ${browser.process()?.pid})`);
        return browser;
    }
    async onApplicationShutdown() {
        const browser = this.browser;
        this.browser = undefined;
        if (!browser)
            return;
        try {
            await (0, with_timeout_1.withTimeout)(browser.close(), 5000, 'browser.close');
        }
        catch (error) {
            browser.process()?.kill('SIGKILL');
        }
    }
};
exports.BrowserService = BrowserService;
exports.BrowserService = BrowserService = BrowserService_1 = __decorate([
    (0, common_1.Injectable)()
], BrowserService);
//# sourceMappingURL=browser.service.js.map