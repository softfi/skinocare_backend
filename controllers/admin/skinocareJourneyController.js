import SkinocareJourney from "../../models/SkinocareJourney.js";
import { errorLog } from "../../config/logger.js"
import { authValues, errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js"

export const getSkinocareJourneyList = async(req, res)=>{
    try {
        let skinocareJournies = await SkinocareJourney.find({isDeleted: false}).select("name videoLink isActive");
        return responseWithData(res, 200, true, "SkinOCare Journies Fetch Successfully", skinocareJournies);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addSkinocareJourney = async(req, res)=>{
    try {
        let user = await authValues(req.headers['authorization']);
        let skinocareJourney =  await SkinocareJourney.create({
            name        :   req?.body?.name,        
            videoLink   :   req?.body?.videoLink,       
            addedBy     :   user?.id,     
        });
        if(skinocareJourney){
            return responseWithoutData(res, 200, true, "SkinOCare Journey Added Successfully");
        }
        return responseWithoutData(res, 400, false, "Failed to Add SkioOCare Journey! Try Again")
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getSkinocareJourneyById = async(req, res)=>{
    try {
        let skinocareJourney = await SkinocareJourney.findOne({ _id:req?.params?.skinocareJourneyId, isDeleted:false}).select("name videoLink isActive");
        if(skinocareJourney){
            return responseWithData(res, 200, true, "SkinOCare Journey Fetch Successfully", skinocareJourney);
        }
        return responseWithoutData(res, 404, false, "SkinOCare Journey Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateSkinocareJourney = async(req, res)=>{
    try {
        let skinocareJourney = await SkinocareJourney.findOne({ _id:req?.body?.skinocareJourneyId, isDeleted:false}).select("name videoLink isActive");
        if(skinocareJourney){
            skinocareJourney.name       = req?.body?.name ?? skinocareJourney.name; 
            skinocareJourney.videoLink  = req?.body?.videoLink ?? skinocareJourney.videoLink;
            skinocareJourney.isActive   = req?.body?.isActive ?? skinocareJourney.isActive;
            if(await skinocareJourney.save()){
                return responseWithoutData(res, 200, true, "SkinOCare Journey Updated Successfully");
            }
            return responseWithoutData(res, 400, false, "Failed to Update SkinOCare Journey");
        }
        return responseWithoutData(res, 404, false, "SkinOCare Journey Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteSkinocareJourney = async(req, res)=>{
    try {
        let skinocareJourney = await SkinocareJourney.findOne({ _id:req?.params?.skinocareJourneyId, isDeleted:false}).select("name videoLink isActive");
        if(skinocareJourney){
            skinocareJourney.isDeleted   = true;
            if(await skinocareJourney.save()){
                return responseWithoutData(res, 200, true, "SkinOCare Journey Deleted Successfully");
            }
            return responseWithoutData(res, 400, false, "Failed to Delete SkinOCare Journey");
        }
        return responseWithoutData(res, 404, false, "SkinOCare Journey Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}