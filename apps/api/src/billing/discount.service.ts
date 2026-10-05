import { DiscountCode } from '@myapp/database';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface ResolvedDiscount {
  discount: number;
  code: string;
}

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(DiscountCode)
    private readonly dscountCodeRepo: Repository<DiscountCode>,
  ) {}

  async resolveDiscount(
    code: string | undefined | null,
    planCurrency: string,
  ): Promise<ResolvedDiscount> {
    
    const normalized = code?.trim().toUpperCase();
    if(!normalized) return {discount: 0, code: null};

    const invalid = () => new BadRequestException('Invalid discount code');

    const row = await this.dscountCodeRepo.findOne({where: {code: normalized}})
    if(!row || !row.is_active) throw invalid();
    if(row.expires_at && row.expires_at.getTime() <= Date.now()) throw invalid();
    if (row.currency.toLowerCase() !== planCurrency.toLowerCase()) throw invalid();

    return { discount: row.flat_amount, code: row.code };
  }
}
