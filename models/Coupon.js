import { model,Schema } from "mongoose";

const couponSchema = Schema({
    code            : { type: String, index: true, unique: true},
    type            : { type: String, required: true, enum: ['flat','percentage'], index:true },
    discount        : { type: Number, index: true },
    discountUpTo    : { type: Number, index: true },
    totalLimit      : { type: Number, index: true, default: null},
    balanceLimit    : { type: Number, index: true, default: null},
    expiredAt       : { type: Date, default: null },
    isActive        : { type: Boolean, default: true },
    isDeleted       : { type: Boolean, default: false },
    addedBy         : { type: Schema.Types.ObjectId, index: true},
},{timestamps:true});

export default model('coupon', couponSchema);