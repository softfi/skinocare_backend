import { model,Schema } from "mongoose";

const categorySchema = Schema({
    name            : { type: String, index: true},
    image           : { type: Schema.Types.ObjectId, index: true},
    parentId        : { type: String, index: true},
    type            : { type: String, required:true, enum: ['category', 'concern', 'productType','faq','sort'], default:"category", index:true },
    isActive        : { type: Boolean, index: true, default:true },
    isDeleted       : { type: Boolean, index: true, default: false },
    addedBy         : { type: Schema.Types.ObjectId, index: true},
},{timestamps:true});

export default model('category', categorySchema);