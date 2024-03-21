import { errorLog } from "../../config/logger.js"
import { errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import User from "../../models/User.js";



export const getCustomerList = async(req, res)=>{
    try {
        let customers = await User.find({ type:"customer", isDeleted: false }).select("customerId name email mobile image isActive createdAt");
        let customerList = [];
        for(let customer of customers){
            if(customer.image){
                customerList.push({ ...customer._doc , image: await getImageSingedUrlById(customer.image) });
            }else{
                customerList.push({ ...customer._doc });
            }
        }
        responseWithData(res, 200, true, "Customer List Fetch Successfully",customerList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
} 

export const getCustomerById = async(req, res)=>{
    try {
        let customers = await User.findOne({ _id:req.params.customerId, isDeleted: false }).select("customerId name age email mobile image isActive");
        if(customers){
           return responseWithData(res, 200, true, "Customer Details Fetch Successfully",customers);
        }
        return responseWithoutData(res, 404, false, "Customer Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateCustomer = async(req, res)=>{
    try {
        let customer = await User.findOne({ _id:req.body.customerId, isDeleted: false }).select("customerId name age email mobile image isActive");
        if(customer){
            let userDetails = await User.findByIdAndUpdate(customer?._id,{$set:{
                image   :req?.body?.image ? req?.body?.image : customer?.image ,  
                name    :req?.body?.name ? req?.body?.name : customer?.name , 
                age     :req?.body?.age ? req?.body?.age : customer?.age ,
                email   :req?.body?.email ? req?.body?.email : customer?.email ,
                mobile  :req?.body?.mobile ? req?.body?.mobile : customer?.mobile ,
            }},{ new: true }).select("customerId name age email mobile image isActive");
            return responseWithData(res, 200, true,"Customer Updated Successfully", userDetails);
        }
        return responseWithoutData(res, 404, false, "Customer Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteCustomer = async(req, res)=>{
    try {
        let customer = await User.findOne({ _id:req.params.customerId, isDeleted: false }).select("customerId name age email mobile image isActive");
        if(customer){
            let userDetails = await User.findByIdAndUpdate(customer?._id,{$set:{
                isDeleted: true  
            }},{ new: true });
            return responseWithoutData(res, 200, true,"Customer Deleted Successfully");
        }
        return responseWithoutData(res, 404, false, "Customer Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}