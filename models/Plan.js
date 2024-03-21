import { model,Schema } from "mongoose";

const planSchema = Schema({
    title           : { type: String, index: true},
    kitId           : { type: Schema.Types.ObjectId, index: true, ref:"kit"},
    image           : { type: Schema.Types.ObjectId, index: true},
    type            : { type: String, enum: ['Advance', 'Pro', 'Assist'], default:"Advance", index:true },
    description     : { type: String, index:true, default:null },
    isActive        : { type: Boolean, index: true, default:true },
    isDeleted       : { type: Boolean, index: true, default: false },
    addedBy         : { type: Schema.Types.ObjectId, index: true},
},{timestamps:true});

export default model('plan', planSchema);