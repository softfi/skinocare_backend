import { errorLog } from "../../config/logger.js";
import {
    errorResponse,
    responseWithData,
    responseWithoutData,
} from "../../helpers/helper.js";

import DietConsultation from "../../models/DietConsultation.js";
export const dietConsultationList = async (req, res) => {
    try {
        let dietConsultationList = await DietConsultation.findOne();
        responseWithData(res, 200, true, "Diet Consultation List Get Successfully", {
            dietConsultationList,
        });
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
};

export const addDietConsultation = async (req, res) => {
    try {
        let dietConsultation = await DietConsultation.create({
            mrp: req?.body?.mrp,
            payableAmount: req?.body?.payableAmount,
            isActive: req.body.isActive,
        });
        if (dietConsultation) {
            responseWithoutData(res, 200, true, "Diet Consultation Created Successfully");
        } else {
            responseWithoutData(res, 500, false, "Diet Consultation Creation Failed.");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
};

export const getDietConsultationById = async (req, res) => {
    try {
        let dietConsultation = await DietConsultation.findOne({ _id: req.params.dietId });
        if (dietConsultation) {
            responseWithData(res, 200, true, "Diet Consultation Retrieved Successfully.", dietConsultation);
        } else {
            responseWithoutData(res, 404, false, "Diet Consultation not found.");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
};

export const updateDietConsultation = async (req, res) => {
    try {
        let dietData = await DietConsultation.findOne({isActive:true});
        let dietConsultation = await DietConsultation.findByIdAndUpdate(
            // req?.body?.dietId,
            dietData?._id,
            {
                name: req?.body?.name,
                mrp: req?.body?.mrp,
                payableAmount: req?.body?.price,
                isActive: req.body.isActive,
            },
            { new: true }
        );
        if (dietConsultation) {
            responseWithoutData(res, 200, true, "Diet Consultation Update Successfully.");
        } else {
            responseWithoutData(res, 403, false, "Failed to Update Diet Consultation");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
};

export const deleteDietConsultation = async (req, res) => {
    try {
        let dietConsultation = await DietConsultation.findOneAndDelete({ _id: req?.params?.dietId });
        if (dietConsultation) {
            responseWithoutData(res, 200, true, "Diet Consultation Deleted Successfully.");
        } else {
            responseWithoutData(res, 404, false, "Diet Consultation Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
};


