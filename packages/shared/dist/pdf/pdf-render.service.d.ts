import { BrowserService } from "./browser.service";
export declare class PdfRenderService {
    private readonly browser;
    private readonly logger;
    constructor(browser: BrowserService);
    render(html: string): Promise<Buffer>;
}
//# sourceMappingURL=pdf-render.service.d.ts.map