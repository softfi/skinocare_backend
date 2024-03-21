import { model, Schema } from "mongoose";

const reviewSchema = new Schema({
    customerId      : { type: Schema.Types.ObjectId, index: true},
    productId       : { type: Schema.Types.ObjectId, index: true},
    comment         : { type: String, index: true},
    attachment      : { type: String, index: true},
    rating          : { type: Number, default: 0,index: true},
    isActive        : { type: Boolean,index: true}
},{timestamps:true});

export default model('review', reviewSchema);