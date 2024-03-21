import User from "../../models/User.js";
import { errorLog } from "../../config/logger.js";
import { errorResponse, responseWithData } from "../../helpers/helper.js";

export const feedbackList = async(req, res)=>{
    try {
        let feedback = await User.find({ feedback: { $exists: true, $type: 'array', $ne: [] } }).select('name email feedback');
        responseWithData(res, 200, true, "FeedBack List Fetch Successfully", feedback);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getFeedbackByUserId = async(req, res)=>{
    try {
        let user = await User.findById(req.params.userId).select('name email feedback');
        responseWithData(res, 200, true,"User Feedback Get Successfully", user ?? []);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}