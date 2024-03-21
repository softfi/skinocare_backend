import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData, uploadToS3 } from "../../helpers/helper.js";
import Plan from "../../models/Plan.js";
import Upload from "../../models/Upload.js";

export const adminPlanList = async (req, res) => {
    try {
        let plans = await Plan.find({ isDeleted: false }).populate("kitId");
        let plansWithImage = [];
        for(let i=0;i<plans.length;i++){
            plansWithImage.push({ ...plans[i]._doc , image: await getImageSingedUrlById(plans[i].image),kitId:[plans[i].kitId]})
        }
        responseWithData(res, 200, true, "Plan List get Successfully", plansWithImage);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addPlan = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let type = {};
        if(req?.body?.type != undefined){
            type = {type:req?.body?.type}
        }
        let plan = await Plan.create({
            title: req.body.title,
            image: req.body.imageId,
            kitId: req.body.kitId,
            description: req.body.description,
            addedBy: user._id,
            ...type
        });
        let updatedRelatedId = await Upload.findByIdAndUpdate(req.body.imageId, {
            relatedId: plan._id
        })
        if (plan && updatedRelatedId) {
            responseWithoutData(res, 200, true, "Plan Created successfully");
        } else {
            responseWithoutData(res, 200, false, "Plan Creation failed");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const getPlanById = async (req, res) => {
    try {
        let plan = await Plan.findOne({ _id: req.params.planId, isDeleted: false });
        if (plan) {
            plan = {...plan?._doc,image: await getImageSingedUrlById(plan?._doc?.image)}
            // Category found
            responseWithData(res, 200, true, "Plan Retrieved Successfully.", plan);
        } else {
            // Category not found
            responseWithoutData(res, 404, false, "Plan Not found.");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const updatePlan = async (req, res) => {
    try {
        let plan = await Plan.findById(req.body.planId);
        if (plan) {
            if (req.body.imageId) {
                await Upload.findByIdAndUpdate(plan.image, {
                    isDeleted: true,
                });

                await Upload.findByIdAndUpdate(req.body.imageId, {
                    relatedId: plan._id,
                });
            }
            const updatedPlan = await Plan.findByIdAndUpdate(plan._id, {
                title: req.body.title ? req.body.title : category.title,
                kitId: req.body.kitId ? req.body.kitId : category.kitId,
                type: req.body.type ? req.body.type : category.type,
                description: req.body.description ? req.body.description : category.description,
                image: req.body.imageId ? req.body.imageId : plan.image,
            }, { new: true });
            if (updatedPlan) {
                responseWithoutData(res, 200, true, "Plan Updated Successfully");
            } else {
                responseWithoutData(res, 501, false, "Something went wrong while updating the Plan")
            }
        }else{
            responseWithoutData(res, 404, false, "Plan Not found");
        }

    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deletePlan = async (req, res) => {
    try {
        let plan = await Plan.findOne({ _id: req.params.planId, isDeleted:false});
        if (plan) {
            plan.isDeleted = true;
            await Upload.findByIdAndUpdate(plan.image,{ isDeleted: true })
            if(await plan.save()){
                responseWithoutData(res, 200, true, "Plan Deleted Successfully")
            }
        } else{
            responseWithoutData(res, 501, true, "Plan Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
} 