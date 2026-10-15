import { PdfJob, PdfJobStatus } from "@myapp/database";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Job } from "bullmq";
import { PdfRenderService, PdfStorage, StorageService, withTimeout } from "@myapp/shared";


const ttlMs = () => Number(process.env.PDF_TTL_MS ?? 60 * 60 * 1000);
const renderTimeoutMs = () => Number(process.env.PDF_RENDER_TIMEOUT_MS ?? 30_000);

@Processor('pdfQueue', {concurrency: 2})
export class PdfProcessor extends WorkerHost{
  private readonly logger = new Logger(PdfProcessor.name)
  constructor(
    @InjectRepository(PdfJob) private readonly jobs: Repository<PdfJob>,
    private readonly pdfRender: PdfRenderService,
    private readonly storage: PdfStorage
  ){
    super();
  }

  async process(job: Job<{jobId: string, html: string}>): Promise<any> {
      const {jobId, html} = job.data;

      const row = await this.jobs.findOne({where: {id: jobId}});
      if(!row) return;
      await this.jobs.update(jobId, {status: PdfJobStatus.PROCESSING})

      const started = Date.now();
      const pdf = await withTimeout(this.pdfRender.render(html), renderTimeoutMs(), 'render');
      const key = `pdf/${row.owner_id}/${jobId}.pdf`;
      await this.storage.upload(key, pdf);

      await this.jobs.update(jobId, {
        status: PdfJobStatus.READY,
        object_key: key,
        expires_at: new Date(Date.now() + ttlMs())
      });

      this.logger.log(`pdf ${jobId} ready (${pdf.length} bytes, ${Date.now() - started}ms)`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job | undefined, err: Error){
    if(!job) return;
    this.logger.warn(`pdf job ${job.data?.jobId} attempt ${job.attemptsMade} failed: ${err.message}`);
    if(job.attemptsMade >= (job.opts.attempts ?? 1)){
      await this.jobs.update(job.data.jobId, {
        status: PdfJobStatus.FAILED,
        error: err.message.slice(0, 500)
      })
    }
  }
}