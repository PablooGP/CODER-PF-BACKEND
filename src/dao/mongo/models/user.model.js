import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const collection = 'users';
const UserSchema = new mongoose.Schema({
    first_name: { type: String, index: true, required: true },
    last_name: { type: String, required: true },
    photo: { type: String, default: "https://static.vecteezy.com/system/resources/thumbnails/001/840/612/small/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg" },
    mail: { type: String, required: true, index: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number , default: 18 },
    role: { type: String, enum: ["user", "admin", "premium"], default: "user"},
    last_connection: { type: Date, default: Date.now, required: true },
    documents: [new mongoose.Schema({
        name: { type: String},
        reference: { type: String}
    })],
    
    verified: {type: Boolean, required: true, default: false}
});

UserSchema.plugin(mongoosePaginate);

const Users = mongoose.model(collection, UserSchema);

export default Users;