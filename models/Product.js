import { model, Schema } from "mongoose";

const productSchema = Schema(
  {
    name: { type: String, index: true },
    thumbnail: { type: String, index: true },
    images: { type: Array, index: true },
    slug: { type: String, index: true },

    price: { type: Number, default: 0, index: true },
    mrp: { type: Number, default: 0, index: true },
    isDiscount: { type: Boolean, required: true, index: true, default: false },
    discountType: { type: String, enum: ["percentage", "flat"], index: true },
    discount: { type: Number, index: true },
    currentStock: { type: Number, index: true },
    refundable: { type: Boolean, index: true },
    // shippingCost    : { type: Number, default: 0 , index: true},
    gst: { type: Number, default: 0, index: true },
    rating: { type: Number, default: 0, index: true },

    ingredients: { type: String, index: true },
    indications: { type: String, index: true },
    disclaimer: { type: String, index: true },
    specifictation: { type: String, required: true },
    whenToUse: { type: String, required: true },
    howToUse: { type: String, required: true },
    howToUseVideo: { type: String, index: true },

    categoryId: { type: Array, required: true, index: true },

    title: { type: String, index: true },
    description: { type: String, index: true },
    metaTitle: { type: String, index: true },
    metaDescription: { type: String, index: true },

    addedBy: { type: Schema.Types.ObjectId, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default model("product", productSchema);
