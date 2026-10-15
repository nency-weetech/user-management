import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ServiceKeyGuard } from '../security/service-key.guard';
import { PdfJob } from '@myapp/database';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreatePdfDto } from './dto/create-pdf.dto';

import { Response } from 'express';
import { PdfService } from './pdf.service';
import { OwnerId } from './owner-id.decorator';

@Controller('pdf')
@UseGuards(ServiceKeyGuard)
export class PdfController {
  constructor(private readonly pdf: PdfService) {}

  @Post()
  @HttpCode(202)
  create(@OwnerId() ownerId: string, @Body() dto: CreatePdfDto) {
    return this.pdf.create(ownerId, dto.html, dto.filename);
  }

  @Get(':id')
  status(@OwnerId() ownerId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.pdf.getStatus(ownerId, id);
  }

  @Get(':id/download')
  @Header('Cache-Control', 'no-store')
  download(@OwnerId() ownerId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.pdf.getDownload(ownerId, id);
  }

  // @Post('generate')
  // async generatePdf(@Body('html') html: string, @Res() res: Response) {
  //   if (!html) {
  //     return res.status(400).json({
  //       message: 'HTML is required',
  //     });
  //   }

  //   const pdf = await this.pdf.generatePdf(html);

  //   res.set({
  //     'Content-Type': 'application/pdf',
  //     'Content-Disposition': 'attachment; filename="invoice.pdf"',
  //     'Content-Length': pdf.length,
  //   });

  //   res.end(pdf);
  // }
}
