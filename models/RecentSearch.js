import { Schema, model } from "mongoose";

const recentSearchSchema = Schema({
    customerId  : { type:Schema.Types.ObjectId, index: true },
    searchTxt   : { type:String, index: true },
    slug        : { type:String, index: true }
}, {timestamps:true});

export default model('recentsearch', recentSearchSchema);