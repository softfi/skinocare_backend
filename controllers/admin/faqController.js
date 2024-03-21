import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Categroy from "../../models/Categroy.js";
import Faq from "../../models/Faq.js";
import { ObjectId } from "mongodb";

export const faqsList = async (req, res) => {
    try {
        let faqs = await Faq.find({ isDeleted: false })
        let faqsList =[];
        for(let i=0;i<faqs.length;i++){
            let category =  await Categroy.findById(faqs[i].categoryId).select('name');
            faqsList.push({_id:faqs[i]._id, question: faqs[i].question, category: category.name, answer: faqs[i].answer, isActive: faqs[i].isActive})
        }
        responseWithData(res, 200, true, "FAQs List Fetched Successfully", faqsList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const addFaq = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let faq = await Faq.create({
            categoryId: req.body.categoryId,
            question: req.body.question,
            answer: req.body.answer,
            addedBy: user._id
        });

        if(faq){
            responseWithoutData(res, 200, true, "FAQ Added Successfully");
        }else{
            responseWithoutData(res, 501, false, "FAQ Creation failed");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const getFaqById = async (req, res) => {
    try {
        let faq = await Faq.findOne({ _id:req.params.faqId, isDeleted:false });
        if(faq){
            responseWithData(res, 200, true, "FAQ Get Successfully", faq);
        }else{
            responseWithoutData(res, 404, false, "FAQ Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}



export const updateFaq = async (req, res) => {
    try {
        let faq = await Faq.findOne({ _id:req.body.faqId, isDeleted: false });
        if(faq){
            faq.categoryId = req.body.categoryId ? req.body.categoryId : faq.categoryId ; 
            faq.question = req.body.question ? req.body.question : faq.question ; 
            faq.answer = req.body.answer ? req.body.answer : faq.answer ; 
            faq.isActive = req.body.isActive ? req.body.isActive : faq.isActive ; 
            if(await faq.save()){
                responseWithoutData(res, 200, true, "FAQ Updated Successfully");
            }else{
                responseWithoutData(res, 501, false, "FAQ Updation failed");
            }
        }else{  
            responseWithoutData(res, 404, false, "FAQ Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteFaq = async (req, res) => {
    try {
        let faq = await Faq.findOne({ _id:req.params.faqId, isDeleted: false });
        if(faq){
            faq.isDeleted = true; 
            if(await faq.save()){
                responseWithoutData(res, 200, true, "FAQ Deleted Successfully");
            }else{
                responseWithoutData(res, 501, false, "FAQ Deletion failed");
            }
        }else{  
            responseWithoutData(res, 404, false, "FAQ Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}
