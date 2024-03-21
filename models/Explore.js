import { model, Schema } from "mongoose";

const exploreSchema = Schema({
    title       : { type:String, index: true},
    upload      : { type:String, index: true }, // Image Or Videos
    uploadType  : { type:String, enum: ['image', 'video'], required:true, index:true },
    description : { type:String },
    addedBy     : { type:Schema.Types.ObjectId, index: true },
    likedBy     : { type:Array, index: true },
    isActive    : { type:Boolean, index:true , default: true},
    isDeleted   : { type:Boolean, index:true , default: false},
}, { timestamps: true });

export default model('explore', exploreSchema);