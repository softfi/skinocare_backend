import { errorLog } from "../../config/logger.js"
import { authValues, errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import User from "../../models/User.js";


export const getUserFeedback = async(req, res)=>{
    try {
        let user =await authValues(req.headers['authorization']);
        responseWithData(res, 200, true,"User Feedback Get Successfully", user?.feedback[0] ?? []);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addOrUpdateUserFeedback = async(req, res)=>{
    try {
        let user = await authValues(req.headers['authorization']);
        if(user){
            let customer = await User.findById(user._id);
            customer.feedback = [{ rating:req.body.rating, review:req.body.reviews }];
            if(await customer.save()){
                return responseWithoutData(res, 200, true,"FeedBack Successfully");
            }
        }
        return responseWithoutData(res, 200, true,"Failed to give Feedback!");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}