import { model, Schema } from "mongoose";

const cartSchema = new Schema({
    customerId      : { type: Schema.Types.ObjectId, index: true},
    productId       : { type: Schema.Types.ObjectId, index: true},
    quantity        : { type: Number, default: 0,index: true},
},{timestamps:true});

export default model('cart', cartSchema);