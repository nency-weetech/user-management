import { BadRequestException } from "@nestjs/common";

export const TAX_RATE_PERCENT = 18;
export const MIN_CHARGE_PAISE = 50;

export interface AmountBreakdown{
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
}

export function toPaisa(price: number | string) : number{
    return Math.round(Number(price) * 100);
}

export function calculateAmount(pricePaise: number, discountPaisa: number): AmountBreakdown{
    if(!Number.isInteger(pricePaise) || pricePaise <= 0){
        throw new BadRequestException('Invalid plan price');
    }

    if(!Number.isInteger(discountPaisa) || discountPaisa <= 0 ){
        throw new BadRequestException('Invalid discount');
    }

    const taxable = pricePaise - discountPaisa;
    if(taxable <= 0 ){
        throw new BadRequestException('Discount cannot reduce the amount to zero');
    }

    const tax = Math.round((taxable * TAX_RATE_PERCENT)/100)
    return {
        subtotal: pricePaise,
        discount: discountPaisa,
        tax,
        total: taxable + tax
    };
}