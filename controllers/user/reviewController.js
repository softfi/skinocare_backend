import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, responseWithoutData } from "../../helpers/helper.js";
import Product from "../../models/Product.js";
import Review from "../../models/Review.js";

export const addReview = async (req,res ) => {
    try {
        let user = await authValues(req.headers['authorization']);
        if(user == null){
            return responseWithoutData(res, 403, false, "No User Found!!");
        }  
        let checkReviews = await Review.findOne({customerId:user?._id,productId:req?.body?.productId});
        if(checkReviews == null){
            await Review.create({
                productId : req?.body?.productId,
                customerId: user?._id,
                comment   : req?.body?.comment,
                rating    : req?.body?.rating,
                isActive    : true,
            });
            return responseWithoutData(res, 200, true, "Review has been added Successfully!!");
        } else {
            await Review.findOneAndUpdate({_id:checkReviews._id},{$set:{
                comment   : req?.body?.comment,
                rating    : req?.body?.rating,
                isActive    : true,
            }});
            return responseWithoutData(res, 200, true, "Review has been Updated Successfully!!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}