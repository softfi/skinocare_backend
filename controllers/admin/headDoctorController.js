import { errorLog } from "../../config/logger.js";
import {
  errorResponse,
  responseWithData,
  responseWithoutData,
} from "../../helpers/helper.js";
import HeadDoctor from "../../models/HeadDoctor.js";

export const headDoctorList = async (req, res) => {
  try {
    let doctorList = await HeadDoctor.find();
    responseWithData(res, 200, true, "Head Doctor List Get Successfully", {
      doctorList,
    });
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  } 
};


export const getHeadDoctorById = async (req, res) => {
  try {
    let doctor = await HeadDoctor.findOne({ _id: req.params.doctorId });
    if (doctor) {
      responseWithData(res, 200, true, "Head Doctor Retrieved Successfully.", doctor);
    } else {
      responseWithoutData(res, 404, false, "Head Doctor not found.");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};

export const updateHeadDoctor = async (req, res) => {
  try {
    let doctor = await HeadDoctor.findByIdAndUpdate(
      req?.body?.doctorId,
      {
        image:req?.body?.image,
        name:req?.body?.name,
        experties:req?.body?.experties,
        shortDescription:req?.body?.shortDescription,
        description:req?.body?.description,
        email:req?.body?.email,
        mobile:req?.body?.mobile,
        alternativeMobile:req?.body?.alternativeMobile,
        specialisation:req?.body?.specialisation,
        designation:req?.body?.designation,
        aboutYou:req?.body?.aboutYou,

      },
      { new: true }
    );
    if (doctor) {
      responseWithoutData(res, 200, true, "Head Doctor Update Successfully.");
    } else {
      responseWithoutData(res, 403, false, "Failed to Update Head Doctor");
    }
  } catch (error) {
    errorLog(error);
    errorResponse(res);
  }
};
