import { model, Schema } from "mongoose";

const transactionSchema = Schema({
    orderId            : { type: Schema.Types.ObjectId, index:true},
    paymentId          : { type: String, index: true},
    orderPaymentId     : { type: String, index: true},
    payerId            : { type: Schema.Types.ObjectId, index: true},
    paymentReceiptId   : { type: String, index: true},
    paymentMethod      : { type: String, index: true},
    paymentStatus      : { type: String, enum: ['success', 'failed','pending'], default:"pending", index:true },
    amount             : { type: Number, index: true},
    transactionType    : { type: String, index: true}
}, { timestamps: true });

export default model('transaction', transactionSchema);

