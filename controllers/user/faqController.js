import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, responseWithoutData } from "../../helpers/helper.js";
import Faq from "../../models/Faq.js";

export const addFaqsLike = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        const faq = await Faq.findById(req.params.faqId);
        const customerId  = user?._id.toString();
        if (!faq.likes.includes(customerId)) {
            faq.likes.push(customerId);
            await faq.save();
            if(faq.disLikes.includes(customerId)){
                faq.disLikes.splice(faq.disLikes.indexOf(customerId), 1);
                await faq.save();
            }
            responseWithoutData(res, 200, false, "Liked Successfully");
        } else {
            faq.likes.splice(faq.likes.indexOf(customerId), 1);
            await faq.save();
            responseWithoutData(res, 200, false, "Like removed Successfully");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
};

export const addFaqsDisLike = async (req, res) => {
    try {
        const faq = await Faq.findById(req.params.faqId);
        let user = await authValues(req.headers['authorization']);
        const customerId  = user?._id.toString();
        if (!faq.disLikes.includes(customerId)) {
            faq.disLikes.push(customerId);
            await faq.save();
            if(faq.likes.includes(customerId)){
                faq.likes.splice(faq.likes.indexOf(customerId), 1);
                await faq.save();
            }
            responseWithoutData(res, 200, false, "Disliked Successfully");
        } else {
            faq.disLikes.splice(faq.disLikes.indexOf(customerId), 1);
            await faq.save();
            responseWithoutData(res, 200, false, "Disliked removed Successfully");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
};
