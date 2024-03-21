import { model, Schema } from "mongoose";

const caseStudySchema = Schema({
    name        : { type:String, index:true },
    imageId     : { type:Schema.Types.ObjectId, index:true },
    age         : { type:Number, index:true },
    title       : { type:String, index:true },
    description : { type:String },
    address     : { type:String },
    addedBy     : { type: Schema.Types.ObjectId },
    isActive    : { type: Boolean, default: true, index:true },
    isDeleted   : { type: Boolean, default: false, index:true }
});

export default model('casestudy', caseStudySchema);