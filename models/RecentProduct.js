import { model, Schema } from "mongoose";

const recentProductSchema = Schema({
    productId       : { type: Schema.Types.ObjectId, index: true },
    userId          : { type: Schema.Types.ObjectId, index: true},
    isActive        : { type: Boolean, default:true, index:true},
    isDeleted       : { type: Boolean, default:false, index:true }
},{timestamps:true});

export default model('recentproducts', recentProductSchema);