import { model, Schema } from "mongoose";

const skinAndHairSchema = Schema({
    name         : { type:String, index:true },
    topic        : { type:String, index:true },
    upload       : { type:String, index:true },
    uploadType   : { type:String, enum: ['image', 'video'], required:true, index:true },
    type         : { type:String, enum: ['hair', 'skin'], required:true, index:true },
    addedBy      : { type:Schema.Types.ObjectId, index: true, },
    isActive     : { type:Boolean, index:true , default: true},
    isDeleted    : { type:Boolean, index:true , default: false},
}, { timestamps: true });

export default model('skinandhair', skinAndHairSchema);