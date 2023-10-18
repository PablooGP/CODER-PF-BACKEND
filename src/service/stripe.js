import Stripe from "stripe"

export default class PaymentService {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    }

    createPaymentIntent = async (data) => {
        return await this.stripe.paymentIntents.create(data)
    }

    createCheckoutSession = async () => {
        return this.stripe.checkout.sessions.create({
            success_url: process.env.STRIPE_SUCCESS_CALLBACK
        })
    }
}