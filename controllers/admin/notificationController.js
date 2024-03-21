import { errorLog } from "../../config/logger.js"
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData, sendPushNotification } from "../../helpers/helper.js";
import AdminNotification from "../../models/AdminNotification.js";
import User from "../../models/User.js";

export const sendPushNotificationAdmin = async (req,res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let title = req?.body?.title;
        let body = req?.body?.description;
        let image = await getImageSingedUrlById(req?.body?.imageId);
        await AdminNotification.create({
            title           : title,
            image           : req?.body?.imageId, 
            description     : body,
            addedBy         : user._id
        });
        let userDatas = await User.find({deviceId:{$ne:null},isDeleted:false}).select("_id deviceId name");
        for(let userData of userDatas){
            body = body.replace("[User Name]", userData?.name);
            await sendPushNotification(userData?._id,title,body,req?.body?.imageId,"/notification")
        }
        return responseWithoutData(res,200,true,"Notification has been send to user Successfully");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const notificationList = async (req,res) => {
    try {
        let admin_notifications = await AdminNotification.find({ isDeleted: false });
        let adminNotificationWithImage = [];
        for(let i=0;i<admin_notifications.length;i++){
            adminNotificationWithImage.push({ ...admin_notifications[i]._doc , image: await getImageSingedUrlById(admin_notifications[i].image)})
        }
        if(adminNotificationWithImage.length > 0) {
            return responseWithData(res, 200, true, "Push Notification List get Successfully!!", adminNotificationWithImage);
        } else {
            return responseWithoutData(res, 201, false, "No Record Found!!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}