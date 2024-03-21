import { model, Schema } from "mongoose";

const testimonialSchema = Schema({
    name        : { type:String, required:true, index:true},
    image       : { type:Schema.Types.ObjectId, required:true },
    age         : { type:Number, index:true },
    title       : { type:String, index:true },
    description : { type:String, index:true },
    address     : { type:String, index:true },
    addedBy     : { type: Schema.Types.ObjectId, required: true },
    isActive    : { type: Boolean, default: true, index:true },
    isDeleted   : { type: Boolean, default: false, index:true }
},{timestamps:true});

export default model('testimonial', testimonialSchema);