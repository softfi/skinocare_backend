import { model, Schema } from "mongoose";

const symtomSchema = Schema(
  {
    name: { type: String, required: true, index: true },
    type: { type: String, enum: ["hair", "skin"], required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default model("symtom", symtomSchema);
