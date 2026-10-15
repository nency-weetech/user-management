import { TAX_RATE_PERCENT } from './pricing.util';

const DEFAULT_BRAND_COLOR = '#d85a30';

export interface InvoiceHtmlInput {
  payment: {
    id: string;
    created_at: Date | string;
    currency: string;
    amount: number; 
    subtotal_amount?: number | null;
    discount_amount?: number | null;
    tax_amount?: number | null;
    coupon_code?: string | null;
  };
  planName: string;
  billedTo: string;
  branding?: { companyName?: string | null; brandColor?: string | null };
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;') // pehle &, warna baaki ke &lt; bhi toot jayenge
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeColor(input?: string | null): string {
  const c = typeof input === 'string' ? input.trim() : '';
  return /^#[0-9a-fA-F]{6}$/.test(c) ? c : DEFAULT_BRAND_COLOR;
}

export function safeCompanyName(input?: string | null): string {
  return (input ?? '').replace(/\s+/g, ' ').trim().slice(0, 60);
}

const money = (paise: number, currency: string) =>
  `${escapeHtml(currency.toUpperCase())} ${(paise / 100).toFixed(2)}`;

export function buildInvoiceHtml(input: InvoiceHtmlInput): string {
  const { payment, planName, billedTo, branding } = input;
  const cur = payment.currency;

  const hasBreakdown = payment.subtotal_amount != null;
  const subtotal = hasBreakdown ? payment.subtotal_amount! : payment.amount;
  const discount = hasBreakdown ? (payment.discount_amount ?? 0) : 0;
  const tax = hasBreakdown ? (payment.tax_amount ?? 0) : 0;
  const total = payment.amount;

  const color = safeColor(branding?.brandColor);
  const company = escapeHtml(safeCompanyName(branding?.companyName));

  const date = new Date(payment.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const coupon = payment.coupon_code
    ? ` (${escapeHtml(payment.coupon_code)})`
    : '';
  const rows = [
    `<tr><td>${escapeHtml(planName.toUpperCase())} Plan</td><td class="num">${money(subtotal, cur)}</td></tr>`,
  ];
  if (discount > 0) {
    rows.push(
      `<tr class="discount"><td>Coupon discount${coupon}</td><td class="num">-${money(discount, cur)}</td></tr>`,
    );
  }
  if (tax > 0) {
    rows.push(
      `<tr><td>Tax (${TAX_RATE_PERCENT}%)</td><td class="num">${money(tax, cur)}</td></tr>`,
    );
  }
  rows.push(
    `<tr class="total"><td>Total paid</td><td class="num">${money(total, cur)}</td></tr>`,
  );

  const note =
    tax > 0
      ? `<p class="note">Total includes ${TAX_RATE_PERCENT}% tax (${money(tax, cur)}). Tax is calculated after discount.</p>`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  :root { --brand: ${color}; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1c1c1a; margin: 0; }
  .header { background: var(--brand); color: #fff; padding: 28px 36px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { margin: 0; font-size: 26px; }
  .page { padding: 32px 36px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 28px; font-size: 13px; color: #555; }
  .meta strong { color: #1c1c1a; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; border-bottom: 2px solid #ddd; padding: 10px 0; color: #555; font-size: 12px; text-transform: uppercase; }
  td { padding: 12px 0; border-bottom: 1px solid #eee; }
  .num { text-align: right; }
  .discount td { color: #0f6e56; }
  .total td { border-bottom: none; font-weight: 700; font-size: 16px; padding-top: 16px; }
  .note { margin-top: 32px; font-size: 12px; color: #888; }
</style>
</head>
<body>
  <div class="header"><h1>${company}</h1><div>INVOICE</div></div>
  <div class="page">
    <div class="meta">
      <div><strong>Billed to</strong><br/>${escapeHtml(billedTo)}</div>
      <div><strong>Invoice date</strong><br/>${escapeHtml(date)}<br/><strong>Payment ID</strong><br/>${escapeHtml(payment.id)}</div>
    </div>
    <table>
      <thead><tr><th>Description</th><th class="num">Amount</th></tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>
    ${note}
  </div>
</body>
</html>`;
}
