import { model, Schema } from "mongoose";

const dietConsultationSchema = Schema(
  {
    name            : { type: String, index: true, default:'' },
    mrp             : { type: Number, required: true, index: true },
    payableAmount   : { type: Number, required: true, index: true },
    isActive        : { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default model("dietConsultation", dietConsultationSchema);
