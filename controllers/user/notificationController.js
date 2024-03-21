import { errorLog } from "../../config/logger.js"
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Notification from "../../models/Notification.js";

export const appNotification = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        let notifications = await Notification.find({ customerId:customer?._id}).sort({createdAt:-1});
        let notificationWithImage = [];
        for(let i=0;i<notifications.length;i++){
            notificationWithImage.push({ ...notifications[i]._doc , image: (notifications[i].image) ? await getImageSingedUrlById(notifications[i].image) : ''})
        }
        if(notificationWithImage.length > 0) {
            return responseWithData(res, 200, true, "Notification List get Successfully!!", notificationWithImage);
        } else {
            return responseWithoutData(res, 201, false, "No Record Found!!");
        }
    } catch (error) { 
        errorLog(error);
        errorResponse(res);
    }
}

export const readUnreadNotification = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        let notification = await Notification.findOne({ _id:req?.body?.notificationId,customerId:customer?._id});
        if(notification){
            let type = (req?.body?.type == "read") ? true : false;
            await Notification.findByIdAndUpdate(notification?._id,{$set:{isRead:type}});
            return responseWithoutData(res, 201, false, `Notification has been ${req?.body?.type} Successfully!!`);
        } else {
            return responseWithoutData(res, 201, false, "Notification Id is invalid!!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteNotification = async (req, res) => {
    try {
        let customer = await authValues(req.headers['authorization']);
        await Notification.deleteMany({customerId:customer?._id});
        return responseWithoutData(res,200,true,"Notification has been deleted Successfully!!");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}