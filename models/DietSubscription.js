import { model, Schema } from "mongoose";

const dietSubscriptionSchema = Schema(
  {
    customerId         : { type: Schema.Types.ObjectId, index: true},
    dietId             : { type: Schema.Types.ObjectId, index: true },
    paymentStatus      : { type: String, enum: ['paid', 'unpaid'], default: "unpaid", index: true },
    transactionId      : { type: String, index: true },
    payableAmount      : { type: Number, index: true },
  },
  { timestamps: true }
);
export default model("dietSubscription", dietSubscriptionSchema);
