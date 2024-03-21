import SkinAndHair from "../../models/SkinAndHair.js";
import { errorLog } from "../../config/logger.js"
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData } from "../../helpers/helper.js"


export const skinAndHairList = async(req, res)=>{
    try {
        let skinAndHairs = await SkinAndHair.find({ isDeleted: false }).select("name topic upload uploadType type addedBy isActive");
        let skinAndHairList = [];
        for(let skinAndHair of skinAndHairs){
            if(skinAndHair.type === "image"){
                skinAndHairList.push({ ...skinAndHair._doc, upload: await getImageSingedUrlById('upload') });
            }else{
                skinAndHairList.push({ ...skinAndHair._doc });
            }
        }
        return responseWithData(res, 200, true, "Skin And Hair List Fetch Successfully", skinAndHairList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
} 

export const addSkinAndHair = async(req, res)=>{
    try {
        let user = await authValues(req.headers['authorization']);
        let skinAndHair = await SkinAndHair.create({
            name        : req?.body?.name,
            topic       : req?.body?.topic,
            upload      : req?.body?.upload,
            uploadType  : req?.body?.uploadType,
            type        : req?.body?.type,
            addedBy     : user?._id,
        });
        if(skinAndHair){
            return responseWithoutData(res, 200, true, "Skin And Hair Added Successfully");
        }
        return responseWithoutData(res, 400, false, "Failed to Add Skin And Hair! Try Again")
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getSkinAndHairById = async(req, res)=>{
    try {
        let skinAndHair = await SkinAndHair.findOne({ _id:req?.params?.skinAndHairId, isDeleted:false}).select("name topic upload uploadType type isActive");
        if(skinAndHair){
            return responseWithData(res, 200, true, "Skin And Hair Fetch Successfully", skinAndHair);
        }
        return responseWithoutData(res, 404, false, "Skin And Hair Not Found")
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateSkinAndHair = async(req, res)=>{
    try {
        let skinAndHair = await SkinAndHair.findOne({ _id:req?.body?.skinAndHairId, isDeleted:false});
        if(skinAndHair){
            skinAndHair.name        = req?.body?.name ?? skinAndHair.name;
            skinAndHair.topic       = req?.body?.topic ?? skinAndHair.topic;
            skinAndHair.upload      = req?.body?.upload ?? skinAndHair.upload;
            skinAndHair.uploadType  = req?.body?.uploadType ?? skinAndHair.uploadType;
            skinAndHair.type        = req?.body?.type ?? skinAndHair.type;
            skinAndHair.isActive    = req?.body?.isActive ?? skinAndHair.isActive;
            if(await skinAndHair.save()){
                return responseWithoutData(res, 200, true, "Skin And Hair Updated Successfully");
            }
            return responseWithoutData(res, 400, false, "Failed to Update Skin And Hair! Try Again")
        }
        return responseWithoutData(res, 404, false, "Skin And Hair Not Found")
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteSkinAndHair = async(req, res)=>{
    try {
        let skinAndHair = await SkinAndHair.findOne({ _id:req?.params?.skinAndHairId, isDeleted:false});
        if(skinAndHair){
            skinAndHair.isDeleted = true;
            if(await skinAndHair.save()){
                return responseWithoutData(res, 200, true, "Skin And Hair Deleted Successfully");
            }
            return responseWithoutData(res, 400, false, "Failed to Delete Skin And Hair! Try Again")
        }
        return responseWithoutData(res, 404, false, "Skin And Hair Not Found")
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}