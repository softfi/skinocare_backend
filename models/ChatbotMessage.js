import { model,Schema } from "mongoose";

const chatBotMessageSchema = Schema({
    message             : { type: String, index: true },
    option              : { type: Array, index: true },
    nextMessageId       : { type: Array, default:null, index: true },
    isSelectOption      : { type: Boolean, default:false, index: true },  //if selectoption true then next message will afterSelectMessageId
    afterSelectMessageId: { type: String, default:null, index: true },
    isExit              : { type: Boolean, index: true },
    isTypable           : { type: Boolean, index: true },
    type                : { type: String, index: true , enum:["hair" , "skin"] , default:"skin" },
    isActive            : { type: Boolean, index: true, default:true },
    isDeleted           : { type: Boolean, index: true, default: false },
},{timestamps:true});

export default model('chatbot_message', chatBotMessageSchema);