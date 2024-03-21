import { errorLog } from "../../config/logger.js";
import { errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import ChatbotMessage from "../../models/ChatbotMessage.js";


export const addChatbotMessage = async(req, res)=>{
    try {
        let message = await ChatbotMessage.create({
            message : req?.body?.message,
            option : req?.body?.option,
            isSelectOption : req?.body?.isSelectOption,
            isExit : req?.body?.isExit,
            isTypable : req?.body?.isTypable,
            type:req?.body?.type
        });
        responseWithData(res, 200, true, "Message Added Successfully", message);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateNextMessageId = async(req, res)=>{
    try {
        let message = await ChatbotMessage.findById(req?.body?.messageId);
        message.nextMessageId = req?.body?.nextMessageId;
        message.afterSelectMessageId = req?.body?.afterSelectMessageId;
        if(await message.save()){
            console.log(message);
            responseWithData(res, 200, true, "Next Message Id Update Successfully", message);
        }else{
            responseWithoutData(res, 404, false, "Message Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}