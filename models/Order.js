import { model, Schema } from "mongoose";

const orderSchema = Schema({
    orderNo: { type: String, index: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, index: true },
    orderStatus: { type: String, enum: ['pending', 'processing', 'confirmed', 'shipped', 'cancelled', 'delivered'], default: "pending", index: true },
    paymentMethod: { type: String, index: true },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: "unpaid", index: true },
    shippingMethod: { type: String, index: true },
    shippingStatus: { type: Object, index: true },
    transactionNo: { type: String, index: true },
    subTotal: { type: Number, index: true },
    shippingAddressId: { type: Schema.Types.ObjectId, index: true },
    couponCode: { type: String, index: true, default: null },
    discount: { type: Number, index: true },
    invoiceNo: { type: String, index: true },
    tax: { type: String, index: true },
    shippingCost: { type: Number, index: true },
    grandTotal: { type: Number, index: true },
    orderDetails: { type: Array, index: true, default: [] },
    shiprocketDetails: { type: Array, index: true, default: [] },
    isKit: { type: Boolean, index: true, default: false },
    kitId: { type: Schema.Types.ObjectId, index: true, default: null, ref:'kit' }
}, { timestamps: true });


export default model('Order', orderSchema);