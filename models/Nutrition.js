import { model, Schema } from "mongoose";

const nutritionSchema = Schema({
    title       : { type:String, unique:true , index:true },
    content     : { type:String },
    isActive    : { type:Boolean, default:true, index:true },
    isDeleted   : { type:Boolean, default:false, index:true }
},{ timestamps:true });

export default model("nutrition", nutritionSchema);