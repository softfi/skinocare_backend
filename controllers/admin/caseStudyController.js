import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import CaseStudy from "../../models/CaseStudy.js";

export const caseStudiesList = async(req, res)=>{
    try {
        let caseStudies = await CaseStudy.find({ isDeleted:false });
        let caseStudiesList = [];
        for(let caseStudy of caseStudies){
            caseStudiesList.push({ ...caseStudy._doc, image: await getImageSingedUrlById(caseStudy.imageId) });
        }
        responseWithData(res, 200, true, "Case Studies List Fetch Successfully!", caseStudiesList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addCaseStudy = async(req, res)=>{
    try {
        let user = await authValues(req.headers['authorization'])
        let caseStudy = await CaseStudy.create({
            name        : req?.body.name, 
            imageId     : req?.body?.imageId, 
            age         : req?.body?.age, 
            title       : req?.body?.title, 
            description : req?.body?.description,
            address     : req?.body?.address,
            addedBy     : user._id
        });
        if(caseStudy){
            responseWithoutData(res, 200, true, "Case Study Added Successfully");
        }else{
            responseWithoutData(res, 201, true, "Fail to Add Case Study");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getCaseStudyById = async(req, res)=>{
    try {
        let caseStudy = await CaseStudy.findOne({ _id:req?.params?.caseStudyId , isDeleted:false });
        if(caseStudy){
            responseWithData(res, 200, true, "Case Study Found Successfully", caseStudy);
        }else{
            responseWithoutData(res, 201, true, "Case Study Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateCaseStudy = async(req, res)=>{
    try {
        let caseStudy = await CaseStudy.findOne({ _id: req?.body?.caseStudyId, isDeleted:false });
        if(caseStudy){
            caseStudy.name        = req?.body?.name ?? caseStudy.name; 
            caseStudy.imageId     = req?.body?.imageId ?? caseStudy.imageId; 
            caseStudy.age         = req?.body?.age ?? caseStudy.age; 
            caseStudy.title       = req?.body?.title ?? caseStudy.title; 
            caseStudy.description = req?.body?.description ?? caseStudy.description;
            caseStudy.address     = req?.body?.address ?? caseStudy.address;
            caseStudy.isActive     = req?.body?.isActive ?? caseStudy.isActive;
            if(await caseStudy.save()){
                responseWithoutData(res, 200, true, "Case Study Update Successfully");
            }else{
                responseWithoutData(res, 400, true, "Failed to Delete Case Study");
            }
        }else{
            responseWithoutData(res, 404, true, "Case Study Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteCaseStudy = async(req, res)=>{
    try {
        let caseStudy = await CaseStudy.findOne({ _id: req?.params?.caseStudyId, isDeleted:false });
        if(caseStudy){
            caseStudy.isDeleted = true;
            if(await caseStudy.save()){
                responseWithoutData(res, 200, true, "Case Study Deleted Successfully");
            }else{
                responseWithoutData(res, 400, true, "Failed to Delete Case Study");
            }
        }else{
            responseWithoutData(res, 404, true, "Case Study Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}