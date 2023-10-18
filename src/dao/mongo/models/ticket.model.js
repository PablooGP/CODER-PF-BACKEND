import { Schema, Types, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const schema = new Schema({
    status: { type: String, required: true, default: "processing"},
    purchase_external: { type: String, required: true, default: ""}, // El id creado por mercadopago para buscar el pago
    purcharser: { type: String },
    products: [{
        product: {
            type: Types.ObjectId,
            ref: "products",
            required: true
        },
        units: {
            type: Number,
            required: true
        },
        type: Object,
    }]
})

schema.plugin(mongoosePaginate)

export default model("ticket", schema)