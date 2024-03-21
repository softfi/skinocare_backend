import { model, Schema } from "mongoose";
var faqSchema = Schema({
    categoryId      : { type: String, index: true},
    question        : { type: String, required: true},
    answer          : { type: String, required: true },
    likes           : { type: Array },
    disLikes        : { type: Array },
    addedBy         : { type: Schema.Types.ObjectId, required: true, index: true },
    isActive        : { type: Boolean, default:true ,index: true },
    isDeleted       : { type: Boolean, default:false , index: true },
},{timestamps:true});

export default model("faq", faqSchema);