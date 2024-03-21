import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Designation from "../../models/Designation.js";


export const designationList = async(req, res)=>{
    try {
        let designations = await Designation.find({ isDeleted:false });
        responseWithData(res, 200, true, "Designation List Fetch Successfully", designations);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addDesignation = async(req, res)=>{
    try {
        let user = authValues(req.headers['authorization']);
        let designation = await Designation.create({
            designation: req?.body?.designation,
            addedBy:user._id
        });
        if(designation){
            return responseWithoutData(res, 200, true, "Designation Added Successfully");
        }
        return responseWithoutData(res, 400, false, "Failed to Added Designation");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getDesignationById = async(req, res)=>{
    try {
        let designation = await Designation.findOne({ _id:req.params.designationId, isDeleted:false });
        if(designation){
         return responseWithData(res, 200, true, "Designation Get Successfully", designation);
        }
        return responseWithoutData(res, 404, false, "Designation Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateDesignation = async(req, res)=>{
    try {
        let designation = await Designation.findOne({ _id:req.body.designationId, isDeleted:false });
        if(designation){
            designation.designation = req?.body?.designation ? req?.body?.designation : designation.designation; 
            designation.isActive = req?.body?.isActive ? req?.body?.isActive : designation.isActive; 
            if(await designation.save()){
                return responseWithoutData(res, 200, true, "Designation Updated Successfully");
            }else{
                return responseWithoutData(res, 404, false, "Failed to Update Designation");
            }
        }
        return responseWithoutData(res, 404, false, "Designation Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteDesignation = async(req, res)=>{
    try {
        let designation = await Designation.findOne({ _id:req.params.designationId, isDeleted:false });
        if(designation){
            designation.isDeleted = true; 
            if(await designation.save()){
                return responseWithoutData(res, 200, true, "Designation Deleted Successfully");
            }else{
                return responseWithoutData(res, 404, false, "Failed to Delete Designation");
            }
        }
        return responseWithoutData(res, 404, false, "Designation Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}