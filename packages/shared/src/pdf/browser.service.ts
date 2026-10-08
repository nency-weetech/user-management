import { Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import puppeteer, { Browser } from "puppeteer";
import { withTimeout } from "./with-timeout";

@Injectable()
export class BrowserService implements OnApplicationShutdown{
    private readonly logger = new Logger(BrowserService.name);
    private browser?: Browser;
    private launching?: Promise<Browser>;

    async get() : Promise<Browser>{
        if(this.browser && this.isUp(this.browser)) return this.browser;
        if(!this.launching) {
            this.launching = this.launch().finally(()=> (this.launching = undefined))
        }
        return this.launching;
    }

    isUp(b: Browser){
        const x =  b as any;
        return typeof x.connected === 'boolean' ? x.connected : x.isConnected();
    }

    async launch() : Promise<Browser>{
        const args = ['--disable-dev-shm-usage', '--disable-gpu']
        if(process.env.PUPPETEER_NO_SANDBOX === 'true'){
            args.push('--no-sandbox', '--disable-setuid-sandbox')
        }
        const browser = await puppeteer.launch({headless: true, args})

        browser.on('disconnected', () => {
            this.logger.warn('Chrome disconnect')
            if(this.browser === browser)  
                this.browser = undefined;
            const proc = browser.process() 
            if( proc && proc.exitCode === null && !proc.killed)
                proc.kill('SIGKILL');
        });

        this.browser = browser;
        this.logger.log(`chrome launched (pid ${browser.process()?.pid})`);
        return browser;
    }

    async onApplicationShutdown() {
        const browser = this.browser;
        this.browser = undefined;
        if(!browser) return ;
        try {
            await withTimeout(browser.close(), 5000, 'browser.close');
        } catch (error) {
            browser.process()?.kill('SIGKILL')
        }
    }
}