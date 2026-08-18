import Stripe from 'stripe';
export declare class StripeService {
    private stripe;
    constructor();
    createCheckoutSession(userId: string): Promise<Stripe.Checkout.Session>;
    verifyWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event;
}
//# sourceMappingURL=stripe.service.d.ts.map