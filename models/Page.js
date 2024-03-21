import { model, Schema } from "mongoose";

const pageSchema = Schema({
    name : { type:String, required: true },
    slug : { type:String, required: true, index: true, unique: true },
    content : { type:String, required:true },
    addedBy : { type:Schema.Types.ObjectId, required: true, index: true },
    isActive : { type:Boolean, default:true , required:true, index:true },
    isDeleted : { type:Boolean, default:false ,required:true, index:true }
},{ timestamps:true });

export default model('page', pageSchema);