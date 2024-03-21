import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import Doctor from "../../models/Doctor.js";

export const docterList = async (req, res) => {
    try {
        let docters = await Doctor.find({ isDeleted: false }).select('image name experties patientHandled shortDescription description');
        let docterList = [];
        for (let i = 0; i < docters.length; i++) {
            docterList.push({ ...docters[i]._doc, image: await getImageSingedUrlById(docters[i].image) })
        }
        responseWithData(res, 200, true, "Doctor List get Successfully", docterList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const addDocter = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let docter = await Doctor.create({
            image: req?.body?.image,
            name: req?.body?.name,
            experties: req?.body?.experties,
            patientHandled: req?.body?.patientHandled,
            shortDescription: req?.body?.shortDescription,
            description: req?.body?.description,
            addedBy: user?._id
        })
        if (docter) {
            responseWithoutData(res, 200, true, "Doctor Added Successfully");
        } else {
            responseWithoutData(res, 400, false, "Failed to Added the Doctor");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const getDoctorById = async (req, res) => {
    try {
        let docter = await Doctor.findOne({ _id: req.params.doctorId, isDeleted: false }).select("image name experties patientHandled shortDescription description");
        if (docter) {
            docter = {...docter?._doc,image: await getImageSingedUrlById(docter?._doc?.image)};
            responseWithData(res, 200, true, "Doctor Details Fetch Successfully", docter);
        } else {
            responseWithoutData(res, 404, false, "Doctor Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateDoctor = async (req, res) => {
    try {
        let user = await authValues(req.headers['authorization']);
        let docter = await Doctor.findOne({ _id: req.body.doctorId, isDeleted: false });
        if (docter) {
            let updatedocter = await Doctor.findByIdAndUpdate(req.body.doctorId, {
                image           : req?.body?.image ?? docter.image,
                name            : req?.body?.name ?? docter.name,
                experties       : req?.body?.experties ?? docter.experties,
                patientHandled  : req?.body?.patientHandled ?? docter.patientHandled,
                shortDescription: req?.body?.shortDescription ?? docter.shortDescription,
                description     : req?.body?.description ?? docter.description,
                addedBy         : user?._id
            },)
            if (updatedocter) {
                responseWithoutData(res, 200, true, "Doctor Updated Successfully");
            } else {
                responseWithoutData(res, 400, false, "Failed to Update the Doctor");
            }
        } else {
            responseWithoutData(res, 404, false, "Doctor Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const deleteDoctor = async (req, res) => {
    try {
        let docter = await Doctor.findOne({ _id: req.params.doctorId, isDeleted: false })
        if (docter) {
            docter.isDeleted = true;
            if (await docter.save()) {
                responseWithoutData(res, 200, true, "Doctor Deleted Successfully");
            } else {
                responseWithoutData(res, 400, false, "Failed to Delete the Doctor");
            }
        } else {
            responseWithoutData(res, 400, false, "Doctor Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}