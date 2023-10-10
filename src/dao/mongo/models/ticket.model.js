import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { v4 as uuidv4 } from 'uuid';

const collection = 'ticket';
const schema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    purchase_datetime: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true },
});

schema.pre('validate', function(next) {
    if (!this.isNew) {
        next();
        return;
    }

    this.code = uuidv4();
    next();
});

schema.plugin(mongoosePaginate);

const Tickets = mongoose.model(collection, schema);

export default Tickets;