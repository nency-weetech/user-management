import {
  OrganizationPlanRepository,
  OrganizationRepository,
  PaymentRepository,
  Payments,
  PaymentStatus,
  PlanType,
  User,
  UserPlanRepository,
} from '@myapp/database';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PdfServiceClient } from './pdf-service.client';
import { CustomInvoicePdfDto } from './dto/custom-invoice-pdf.dto';
import { buildInvoiceHtml } from './invoice-html';

@Injectable()
export class CustomInvoicePdfService {
  private readonly logger = new Logger(CustomInvoicePdfService.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly userPlanRepo: UserPlanRepository,
    private readonly orgPlanRepo: OrganizationPlanRepository,
    private readonly orgRepo: OrganizationRepository,
    private readonly pdf: PdfServiceClient,
  ) {}

  async create(user: User, paymentId: string, dto: CustomInvoicePdfDto) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: { plan: true, organization: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');
   await this.assertOwnsPayment(user, payment);

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException(
        'Only completed payment have an invoice pdf',
      );
    }

    if (!(await this.isPremium(user, payment))) {
      throw new ForbiddenException(
        'Custom invoice PDFs are available on paid plans',
      );
    }

    const html = buildInvoiceHtml({
      payment,
      planName: payment.plan?.name ?? 'plan',
      billedTo: payment.organization?.name ?? user.email,
      branding: { companyName: dto.companyName, brandColor: dto.brandColor },
    });

    return this.pdf.create(user.id, html, 'invoice.pdf');
  }

  async status(user: User, jobId: string) {
    const s = await this.pdf.status(user.id, jobId);
    return {
      jobId: s.id,
      status: s.status,
      filename: s.filename,
      expiresAt: s.expiresAt,
      error: s.status === 'failed' ? 'PDF generation failed' : null,
    };
  }

  download(user: User, jobId) {
    return this.pdf.downloadUrl(user.id, jobId);
  }

  private async assertOwnsPayment(user: User, payment: Payments) {
    if (payment.organization_id) {
      const isAdmin = await this.orgRepo.findIsAdmin(
        payment.organization_id,
        user.id,
      );
      if (!isAdmin) throw new NotFoundException('Payment not found');
      return;
    }
    console.log("pid", payment.user_id)
    console.log(user.id)
    if (payment.user_id !== user.id)
      throw new NotFoundException('Payment not found');
  }

  private async isPremium(user: User, payment: Payments): Promise<boolean> {
    const plan = payment.organization_id
      ? (await this.orgPlanRepo.findByOrgId(payment.organization_id))?.plan
      : (await this.userPlanRepo.findByUserId(payment.user_id))?.plan;

    return !!plan?.name && plan.name !== PlanType.FREE;
  }
}
