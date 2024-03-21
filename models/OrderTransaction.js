import { model, Schema } from "mongoose";
const orderTransactionSchema = Schema({
    orderId            : { type: Schema.Types.ObjectId, index: true},
    orderAmount        : { type: Number, index: true},
    paymentStatus      : { type: String, enum: ['success', 'failed','pending'], default:"pending", index:true },
    deliveryCharge     : { type: Number, index: true },
    tax                : { type: Number, index: true },
    customerId         : { type: Schema.Types.ObjectId, index: true },
    deliveredBy        : { type: String, default: 'admin', index: true },
    paymentMethod      : { type: String, index: true },
    transactionId      : { type: String, index: true },
}, { timestamps: true });

export default model('ordertransaction', orderTransactionSchema); 