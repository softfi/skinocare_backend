import { model,Schema } from "mongoose";

const designationSchema = Schema({
    designation     : { type: String, index: true, unique: true},
    addedBy         : { type: Schema.Types.ObjectId, index: true},
    isActive        : { type: Boolean, index: true, default:true },
    isDeleted       : { type: Boolean, index: true, default: false },
},{timestamps:true});

export default model('designation', designationSchema);