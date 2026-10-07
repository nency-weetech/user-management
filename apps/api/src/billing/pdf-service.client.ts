import {
  BadGatewayException,
  ConflictException,
  GoneException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class PdfServiceClient {
  private readonly logger = new Logger(PdfServiceClient.name);

  private async call<T>(
    ownerId: string,
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const base = process.env.PDF_SERVICE_URL;
    const key = process.env.PDF_SERVICE_KEY;

    if (!base || !key)
      throw new Error('PDF_SERVICE_URL / PDF_SERVICE_KEY not set');
    let res: Response;
    try {
      res = await fetch(`${base}${path}`, {
        method,
        headers: {
          'x-service-key': key,
          'x-owner-id': ownerId,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      this.logger.error(`PDF service unreachable: ${(error as Error).message}`);
      throw new BadGatewayException('PDF service is unavailable');
    }

    if (res.ok) return (await res.json()) as T;

    switch (res.status) {
      case 404:
        throw new NotFoundException();
      case 409:
        throw new ConflictException('PDF not fount');
      case 410:
        throw new GoneException('PDF has expired');
      case 429:
        throw new HttpException(
          'Too many PDFs in progress, try again shortly',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      default:
        this.logger.error(`PDF service returned ${res.status}`);
        throw new BadGatewayException('PDF service error');
    }
  }

  create(ownerId: string, html: string, filename: string) {
    return this.call<{ jobId: string; status: string }>(
      ownerId,
      'POST',
      '/pdf',
      { html, filename },
    );
  }

  status(ownerId: string, jobId: string) {
    return this.call<{
      id: string;
      status: string;
      filename: string | null;
      error: string | null;
      expiresAt: string | null;
    }>(ownerId, 'GET', `/pdf/${encodeURIComponent(jobId)}`);
  }

  downloadUrl(ownerId: string, jobId: string) {
    return this.call<{ url: string; expiresIn: number }>(
      ownerId,
      'GET',
      `/pdf/${encodeURIComponent(jobId)}/download`,
    );
  }
}
