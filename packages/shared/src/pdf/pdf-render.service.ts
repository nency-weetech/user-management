import { Injectable, Logger } from "@nestjs/common";
import { BrowserService } from "./browser.service";

@Injectable()
export class PdfRenderService {
    private readonly logger = new Logger(PdfRenderService.name)

    constructor(private readonly browser: BrowserService){}

    async render(html : string): Promise<Buffer>{
        const browser = await this.browser.get()
        const page = await browser.newPage();
        let blocked = 0;
        
        try {
            await page.setJavaScriptEnabled(false);
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const url = req.url();
                if(url.startsWith('data:') || url.startsWith('about:')){
                    req.continue().catch(()=> undefined)
                }else {
                    blocked++ ;
                    req.abort('blockedbyclient').catch(()=> undefined)
                }
            })

            page.setDefaultTimeout(15_000);
            await page.setContent(html, {waitUntil: 'load'});

            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {top: 0, right: 0, bottom: 0, left: 0}
            })

            if(blocked > 0 ) 
                this.logger.warn(`Blocked ${blocked} external request(s) while rendering`);

            return Buffer.from(pdf);

        } catch (error) {
            await page.close().catch(() => undefined)
        }
    }
}