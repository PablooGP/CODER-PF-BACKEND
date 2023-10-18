
import { MercadoPagoConfig, Payment, Preference, MerchantOrder } from "mercadopago/dist/src/index.js"
import fetch from 'node-fetch';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESSTOKEN });
const preference = new Preference(client)
const payments = new Payment(client)
const merchantOrder = new MerchantOrder(client);

export default class PaymentService {
    constructor() {

    }

    static createPaymentIntent = async ({ description, email, items, external, fullname = "Usuario desconocido" }) => {
        const body = {
            payer: {
                phone: {
                    area_code: "11",
                    number: "12345678"
                },
                address: {
                    zip_code: "5555",
                    street_name: "calle falsa",
                    street_number: "123"
                },
                email: email,
                name: fullname,
            },
            back_urls: {
                failure: process.env.MERCADOPAGO_CALLBACK_FAILURE + "?redirect=true",
                pending: process.env.MERCADOPAGO_CALLBACK_PENDING + "?redirect=true",
                success: process.env.MERCADOPAGO_CALLBACK_SUCCESS + "?redirect=true",
            },
            notification_url: process.env.MERCADOPAGO_WEBHOOK,
            external_reference: external, // Esto seria el id del ticket.
            items
        };

        const response = await preference.create({ body })
        return response
    }

    static searchPayment = async (searchParams) => {
        try {
            const request = await fetch(`https://api.mercadopago.com/v1/payments/search${String(searchParams).length > 0 ? `?${searchParams}` : ""}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESSTOKEN}`
                }
            })

            const status = request.status

            if (status == 200) {
                return {
                    success: true,
                    status: status,
                    response: await request.json()
                }
            }
        } catch (error) {
            return {
                success: false,
                status: 500,
                message: error.message
            }
        }
    }

    static verifyPayment = async () => { // SIN USAR / NO USAR
        // Al final no use esto porque no encontre la manera de hacer una busqueda mas avanzada
        payments.search({
            criteria: "desc",
            sort: "id",
            external_reference: "652f1e682e360fb011889c67",
            id: 65471671674
        }).then(res => {
            console.log(res)
        }).catch(err => {
            console.log("hubo un error:", err)
        })
    }

}