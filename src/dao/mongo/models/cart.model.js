import { model, Schema, Types } from 'mongoose'

const collection = 'carts'
const schema = new Schema({
    products: [{
        product: {
            type: Types.ObjectId,
            ref: "products",
            required: true
        },
        units: {
            type: Number,
            require: true
        },
        type: Object,
    }]
})

export default model(collection,schema)
