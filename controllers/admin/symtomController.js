import { errorLog } from "../../config/logger.js";
import {
  errorResponse,
  responseWithData,
  responseWithoutData,
} from "../../helpers/helper.js";
import Symtom from "../../models/Symtom.js";

export const symtomList = async (req, res) => {
  try {
    let symtomList = await Symtom.find();
    responseWithData(res, 200, true, "Symtom List Get Successfully", {
      symtomList,
    });
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const addSymtom = async (req, res) => {
  try {
    let symtom = await Symtom.create({
      name: req?.body?.name,
      type: req?.body?.type,
      isActive: req.body.isActive,
    });
    if (symtom) {
      responseWithoutData(res, 200, true, "Symtom Created Successfully");
    } else {
      responseWithoutData(res, 500, false, "Symtom Creation Failed.");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const getSymtomById = async (req, res) => {
  try {
    let symtom = await Symtom.findOne({ _id: req.params.symtomId });
    if (symtom) {
      responseWithData(
        res,
        200,
        true,
        "Symtom Retrieved Successfully.",
        symtom
      );
    } else {
      responseWithoutData(res, 404, false, "Symtom not found.");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const updateSymtom = async (req, res) => {
  try {
    let symtom = await Symtom.findByIdAndUpdate(
      req?.body?.symtomId,
      {
        name: req?.body?.name,
        type: req?.body?.type,
        isActive: req.body.isActive,
      },
      { new: true }
    );
    if (symtom) {
      responseWithoutData(res, 200, true, "Symtom Update Successfully.");
    } else {
      responseWithoutData(res, 403, false, "Failed to Update Symtom");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const deleteSymtom = async (req, res) => {
  try {
    let symtom = await Symtom.findOneAndDelete({ _id: req?.params?.symtomId });
    if (symtom) {
      responseWithoutData(res, 200, true, "Symtom Deleted Successfully.");
    } else {
      responseWithoutData(res, 404, false, "Symtom Not Found");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};
