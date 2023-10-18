import tickets from "../dao/mongo/models/ticket.model.js"
import MercadopagoPayment from "../service/mercadopago.js"

export default async (req, res, next) => {
    try {
        const { redirect, merchant_order_id, preference_id, payment_type, external_reference, payment_id, collection_id, status} = req.query
        // Se debe verificar el pago en mercadopago para que la database prueda procesarlo
        const pay = await MercadopagoPayment.searchPayment(`id=${payment_id}&external_reference=${external_reference}&limit=1`)
        console.log(pay.response.results)
        if (pay.success && pay.response.results[0] != null) {
            const paymentstatus = pay.response.results[0].status
            const ticket = await tickets.findById(external_reference)
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
        
    } catch (error) {
        next(error)
    }
}