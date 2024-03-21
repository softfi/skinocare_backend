import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Explore from "../../models/Explore.js";

export const exploreList = async (req, res) => {
    try {
        let explores = await Explore.find({ isDeleted: false }).select("title upload uploadType description");
        let exploreList =[];
        for(let explore of explores){
            exploreList.push({ ...explore._doc , upload: (explore.uploadType == 'image') ? await getImageSingedUrlById(explore.upload) : explore.upload})
        }
        responseWithData(res, 200, true, "Explore List Fetch Successfully", exploreList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addExplore = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let explore = await Explore.create({
            title: req?.body?.title,
            upload: req?.body?.upload,
            uploadType: req?.body?.uploadType.trim(),
            description: req?.body?.description,
            addedBy: user?._id,
        });
        if(explore){
            responseWithoutData(res, 200, true, "Explore Added Successfully");
        }else{
            responseWithoutData(res, 400, false, "Failed to Added Explore!");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getExploreById = async(req, res)=>{
    try {
        let explore = await Explore.findOne({ _id:req.params.exploreId, isDeleted:false }).select("title upload uploadType description");
        if(explore){
            explore = {...explore._doc,uploadId:explore.upload,upload:(explore.uploadType == 'image') ? await getImageSingedUrlById(explore.upload) : explore.upload};
            responseWithData(res, 200, true, "Explore Fetch Successfully", explore);
        }else{
            responseWithoutData(res, 404, false, "Explore Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateExplore = async(req, res)=>{
    try {
        let explore = await Explore.findOne({ _id:req.body.exploreId, isDeleted:false });
        if(explore){
            explore.title = req?.body?.title ?? explore.title; 
            explore.upload = req?.body?.upload ?? explore.upload ;
            explore.uploadType = req?.body?.uploadType.trim() ?? explore.uploadType ;
            explore.description = req?.body?.description ?? explore.description ;
            explore.isActive = req?.body?.isActive ?? explore.isActive ;
            if(await explore.save()){
                responseWithData(res, 200, true, "Explore Updated Successfully"); 
            }else{
                responseWithData(res, 400, false, "Failed to Update Explore");
            }
        }else{
            responseWithoutData(res, 404, false, "Explore Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteExplore = async(req, res)=>{
    try {
        let explore = await Explore.findOne({ _id:req.params.exploreId, isDeleted:false }).select("title upload uploadType description");
        if(explore){
            explore.isDeleted = true; 
            if(explore.save()){
                responseWithoutData(res, 200, true, "Explore Deleted Successfully");
            }
        }else{
            responseWithoutData(res, 404, false, "Explore Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}