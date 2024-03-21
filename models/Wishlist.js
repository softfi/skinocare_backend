import { model, Schema } from "mongoose";

export const wishlistSchema = new Schema({
    productId       : { type: Schema.Types.ObjectId, required: true, ref:"Product", index: true},
    customerId      : { type: Schema.Types.ObjectId, index: true }
},{timestamps:true});

export default model('wishlist', wishlistSchema);