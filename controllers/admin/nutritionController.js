import { errorLog } from "../../config/logger.js";
import { errorResponse, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Nutrition from "../../models/Nutrition.js";

export const nutritionList = async (req, res) => {
    try {
        let nutrition = await Nutrition.find({ isDeleted: false });
        responseWithData(res, 200, true, "Nutrition List Fetch Successfully", nutrition);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addNutrition = async (req, res) => {
    try {
        let nutrition = await Nutrition.create({
            title: req.body.title,
            content: req.body.content
        });
        if (nutrition) {
            responseWithoutData(res, 200, true, "Nutrition Added Successfully")
        }
        else {
            responseWithoutData(res, 403, false, "Failed to Add Nutrition")
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getNutritionById = async (req, res) => {
    try {
        let nutrition = await Nutrition.findOne({ _id: req.params.nutritionId, isDeleted: false });
        if (nutrition) {
            responseWithData(res, 200, true, "Nutrition Get Successfully", nutrition);
        } else {
            responseWithoutData(res, 404, false, "Nutrition Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateNutrition = async (req, res) => {
    try {
        let nutrition = await Nutrition.findOne({ _id: req.body.nutritionId, isDeleted: false });
        if (nutrition) {
            nutrition.title = req.body.title;
            nutrition.content = req.body.content;
            if (await nutrition.save()) {
                responseWithoutData(res, 200, true, "Nutrition Updated Successfully");
            } else {
                responseWithoutData(res, 403, false, "Failed to Update Nutrition");
            }
        } else {
            responseWithData(res, 404, false, "Nutrition Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteNutrition = async (req, res) => {
    try {
        let nutrition = await Nutrition.findOne({ _id: req.body.nutritionId, isDeleted: false });
        if (nutrition) {
            nutrition.isDeleted = true;
            if (await nutrition.save()) {
                responseWithoutData(res, 200, true, "Nutrition Deleted Successfully");
            } else {
                responseWithoutData(res, 403, false, "Failed to Delete Nutrition");
            }
        } else {
            responseWithData(res, 404, false, "Nutrition Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}