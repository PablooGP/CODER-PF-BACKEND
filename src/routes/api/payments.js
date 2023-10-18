import { Router } from "express"
import { Types } from "mongoose"
import carts from "../../dao/mongo/models/cart.model.js"
import tickets from "../../dao/mongo/models/ticket.model.js"
import StripePayment from "../../service/stripe.js"
import MercadopagoPayment from "../../service/mercadopago.js"

import paymentHandler from "../../middlewares/paymentHandler.js"

const Payments = new StripePayment()

const router = Router()


router.post("/payment-intent", async (req, res, next) => {
    try {
        const { cartId } = req.query
        const mail = req.user != null ? req.user.mail : req.body.usermail

        const finded = await carts.findByIdAndDelete(cartId)
        if (finded == null) return res.status(404).json({
            success: false,
            status: 404,
            message: `cart '${cartId}' is null`
        })
        if (!mail) return res.status(400).json({
            success: false,
            status: 400,
            message: "'usermail' required"
        })

        const defaultProducts = finded.products
        const populate = await finded.populate({
            path: 'products',
            populate: {
                path: 'product',
                model: "products"
            }
        })

        const items = []
        populate.products.forEach(prod => {
            items.push({
                title: prod.product.title,
                quantity: prod.units,
                currency_id: "ARS",
                unit_price: prod.product.price / 10 // el precio se divide en 10 para no gastar la plata de la cuenta de prueba
            })
        })

        let fullname = null
        if (req.user != null) {
            fullname = req.user.first_name + req.user.last_name
        }

        const newTicket = new tickets({
            purcharser: req.user != null ? req.user.id : mail,
            products: defaultProducts,
        })

        const paymentResponse = await MercadopagoPayment.createPaymentIntent({ description: "Pago a OpticaFlex", email: mail, items, fullname, external: newTicket.id })
        newTicket.purchase_external = paymentResponse.id
        newTicket.save()

        return res.status(201).json({
            success: true,
            status: 201,
            response: {
                redirect_url: paymentResponse.init_point,
                id: paymentResponse.id,
            }
        })

    } catch (error) {
        next(error)
    }
})


router.post("/mercadopago-webhook", async (req, res, next) => {
    try {
        const { id, topic } = req.query

        console.log("se recibio una solicitud webhook")
        console.log(req.query)
        if (topic == "payment") {

            // Se debe verificar el pago en mercadopago para que la database prueda procesarlo
            const pay = await MercadopagoPayment.searchPayment(`id=${id}&limit=1`)

            console.log(pay)
            if (pay.success && pay.response.results[0] != null) {
                const paymentstatus = pay.response.results[0].status
                const ticket = await tickets.findById(external_reference)
                console.log("TICKET FOUND?", ticket)
                if (ticket == null) return res.status(404).json({
                    success: false,
                    status: 404,
                    message: "ticket is null"
                })

                ticket.status = paymentstatus
                await ticket.save()

                if (redirect != null && redirect == "true") {
                    return res.redirect("/paymentStatus/" + external_reference)
                } else {
                    return res.status(200).json({
                        success: true,
                        status: 200,
                        message: "new ticket status: " + paymentstatus
                    })
                }
            } else {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: "ticket not found"
                })
            }
        }
    } catch (error) {
        next(error)
    }
})

router.get("/payment-failure", paymentHandler)
router.get("/payment-pending", paymentHandler)
router.get("/payment-success", paymentHandler)

/*
router.get("/payment-intent", async (req, res, next) => {
    try {

        const { cartId } = req.query

        if (!cartId) return res.status(404).json({
            success: false,
            status: 404,
            message: "cartid not found"
        })

        const finded = await cart.findById(cartId)
        if (finded == null) return res.status(404).json({
            success: false,
            status: 404,
            message: "cart is null"
        })

        const populate = await finded.populate({
            path: 'products',
            populate: {
                path: 'product',
                model: "products"
            }
        })

        const orderDetails = {}
        let total = 0

        populate.products.forEach(prod => {
            orderDetails[prod.product.title] = prod.units
            total += prod.product.price * prod.units
        })
        
        const paymentIntentInfo = {
            amount: total,
            currency: "usd",
            payment_method_types: [
                "card"
            ],
            metadata: {
                userid: req.user?.id || cartId,
                orderDetails: JSON.stringify(orderDetails),
                address: JSON.stringify({
                    street: "Calle falsa 123",
                    postalCode: "39441",
                    externalNumber: "123"
                }, null, "\t")
            }
        }

        const data = await Payments.createPaymentIntent(paymentIntentInfo)

        console.log(data)

        return res.status(201).json({
            success: true,
            status: 201,
            response: data
        })
    } catch (error) {
        next(error)
    }
});*/

export default router