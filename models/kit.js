import { model, Schema } from "mongoose";

const kitSchema = Schema(
  {
    name: { type: String, required: true, index: true },
    price: { type: String, required: true, index: true },
    mrp: { type: String, required: true, index: true },
    symtom: { type: Array, index: true, ref: 'symtom' },
    image: { type: Schema.Types.ObjectId, index: true },
    type: { type: String, enum: ["advance", "pro", "assist"], index: true },
    products: { type: Array, index: true, ref: 'product' },
    instruction: { type: Array, index: true, default:[]},
    validity: { type: Number, index: true, default:60},
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default model("kit", kitSchema);
