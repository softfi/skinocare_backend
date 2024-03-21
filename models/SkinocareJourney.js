import { model, Schema } from "mongoose";

const skinocareJourneySchema = Schema({
    name        : { type:String, index: true },
    videoLink   : { type:String, index: true },
    addedBy     : { type:Schema.Types.ObjectId, index: true },
    isActive    : { type:Boolean, index:true , default: true},
    isDeleted   : { type:Boolean, index:true , default: false},
},{ timestamps: true });

export default model('SkinocareJourney', skinocareJourneySchema);