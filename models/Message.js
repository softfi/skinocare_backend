import { model,Schema } from "mongoose";

const messageSchema = Schema({
    message         : { type: String, index: true },
    customerId      : { type: Schema.Types.ObjectId, index: true, default:null },
    isSendByBot     : { type: Boolean, index: true },
    botMessageId    : { type: Schema.Types.ObjectId, index: true, default:null },
    type            : { type: String, index: true , enum:["hair" , "skin"] },
    isImage         : { type: Boolean, index: true, default: false },
    isDeleted       : { type: Boolean, index: true, default: false },
},{timestamps:true});

export default model('message', messageSchema);