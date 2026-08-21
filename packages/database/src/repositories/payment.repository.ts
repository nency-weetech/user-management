import { InjectRepository } from '@nestjs/typeorm';
import { BaseAbstractRepostitory } from '../common/base.repository';
import { Payments } from '../entities/payment.entity';
import { In, LessThan, Repository } from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentsInterface } from '../interfaces/payments.interface';
import { UserPlanEnum } from '../enums/user-plan.enum';
import { UserRepository } from './user.repository';
import { User } from '../entities/user.entity';

export class PaymentRepository
  extends BaseAbstractRepostitory<Payments>
  implements PaymentsInterface
{
  constructor(
    @InjectRepository(Payments)
    private readonly paymentsRepo: Repository<Payments>,
    private readonly userRepository: UserRepository,
  ) {
    super(paymentsRepo);
  }

  createPayment(
    userId: string,
    plan: UserPlanEnum,
    paymentIntentId: string,
    amount: number,
    currency: string,
  ): Promise<Payments> {
    const userPayment = this.paymentsRepo.create({
      userId,
      stripePaymentIntentId: paymentIntentId,
      plan,
      amount,
      currency,
      status: PaymentStatus.PENDING,
    });
    return this.paymentsRepo.save(userPayment);
  }

  findBySessionId(sessionId: string): Promise<Payments | null> {
    return this.paymentsRepo.findOneBy({ stripeCheckoutSessionId: sessionId });
  }

  findByPaymentIntentId(paymentIntentId: string): Promise<Payments | null> {
    return this.paymentsRepo.findOneBy({ stripeCheckoutSessionId: paymentIntentId });
  }

  async markSucceeded(
    paymentIntentId: string,
  ): Promise<void> {
    await this.paymentsRepo.update(
      {  stripePaymentIntentId: paymentIntentId },
      {
        status: PaymentStatus.SUCCEEDED,
      },
    );
  }

  async markExpired(paymentIntentId: string,): Promise<void> {
    await this.paymentsRepo.update(
      {  stripePaymentIntentId: paymentIntentId },
      {
        status: PaymentStatus.EXPIRED,
      },
    );
  }

  async findStalePending(cutoff: Date): Promise<Payments[]> {
    return this.paymentsRepo.find({
      where: { status: PaymentStatus.PENDING, createdAt: LessThan(cutoff) },
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    status?: PaymentStatus,
    plan?: UserPlanEnum,
  ): Promise<[Payments[], number]> {
    const skip = (page - 1) * limit;
    const query = this.paymentsRepo.createQueryBuilder('payment');

    if (status) {
      query.andWhere('payment.status = :status', { status });
    }

    if (plan) {
      query.andWhere('payment.plan = :plan', { plan });
    }

    query.orderBy('payment.createdAt', 'DESC').skip(skip).take(limit);

    const [payments, total] = await query.getManyAndCount();

    const userIds = payments.map((p) => p.userId);
    const users = await this.userRepository.findManyByCondition({
      where: { id: In(userIds) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    const enrichPayment = payments.map((p) => ({
      ...p,
      user: userMap.get(p.userId) || null,
    }));

    return [enrichPayment, total];
  }
}
