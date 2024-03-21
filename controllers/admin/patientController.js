import { errorLog } from "../../config/logger.js"
import { errorResponse, responseWithData } from "../../helpers/helper.js";
import Doctor from "../../models/Doctor.js";
import DoctorDetail from "../../models/DoctorDetail.js";
import Order from "../../models/Order.js";
import User from "../../models/User.js";

export const patientListWithCallStatus = async(req,res) => {
    try {
        let patients = await User.find({type:"customer",isDeleted:false}).sort({updatedAt:-1});
        let lists = [];
        for(let patient of patients) {
            lists.push({
                ...patient?._doc,
                hairDoctor : await DoctorDetail.findById(patient?.hairDoctor),
                hairKitPurchase : (await Order.findOne({customerId:patient?._id,isKit:true,kitId:patient?.hairKitId,$or: [{ paymentMethod: 'cod'}, { paymentMethod: 'online', paymentStatus: 'paid'}]})) ? true : false,
                skinDoctor : await DoctorDetail.findById(patient?.skinDoctor),
                skinKitPurchase : (await Order.findOne({customerId:patient?._id,isKit:true,kitId:patient?.skinKitId,$or: [{ paymentMethod: 'cod'}, { paymentMethod: 'online', paymentStatus: 'paid'}]})) ? true : false,
            });
        }
        return responseWithData(res, 200, true, "Patient List Fetch Successfully",lists );
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}