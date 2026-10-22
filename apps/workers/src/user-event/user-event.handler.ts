import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { ParsedEvent, PoissionMessageError } from './parse-event';
import { WMailService } from '../mail/mail.service';
import { generateOtp, hashOtp, OTP_TTL_MS } from '@myapp/shared';

@Injectable()
export class UserEventHandler {
  private readonly log = new Logger(UserEventHandler.name);
  private readonly consumerName = 'user-event';

  constructor(
    private readonly ds: DataSource,
    private readonly mailService: WMailService,
  ) {}

  async handler(evt: ParsedEvent) {
    const { userId, email } = evt.payload as { userId?: string; email?: string };

    if (!userId || !email) throw new PoissionMessageError('userId/email missing');

    await this.ds.transaction(async (manager) => {
      const row = await manager.query(
        `INSERT INTO processed_events (event_id, consumer) VALUES ($1, $2)
            ON CONFLICT DO NOTHING RETURNING event_id`,
        [evt.eventId, this.consumerName],
      );
      if (row.length === 0) {
        this.log.warn(`duplicate event ${evt.eventId}, skipped`);
        return;
      }

      const otp = generateOtp();
      const res = await manager.update(
        'users',
        {id: userId},
        {
            email_verification_otp: hashOtp(otp, email),
            email_verification_expires: new Date(Date.now() + OTP_TTL_MS)
        }
      );
    if (!res.affected) throw new PoissionMessageError(`user not found: ${userId}`);

    await this.mailService.sendVerificationOtpEmail(email, otp)
    });
  }
}
