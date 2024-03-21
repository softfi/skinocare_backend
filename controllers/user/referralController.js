import { errorLog } from "../../config/logger.js"
import { authValues, errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import User from "../../models/User.js";

export const getUserReferralCode = async(req, res)=>{
    try {
        let user = await authValues(req.headers['authorization']);
        return responseWithData(res, 200, true, "Referral Code get Successfully", {referralCode:user?.referralCode ?user?.referralCode: ""});
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const verifyReferralCode = async(req, res)=>{
    try {
     const user = await User.findOne({referralCode:req?.body?.referralCode,type:'customer'});
     if(user){
         return responseWithoutData(res, 200, true, "Referral Code Valid");
     }else{
        return responseWithoutData(res, 404, false, "Referral Code InValid");
     }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}