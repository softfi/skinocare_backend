import { errorLog } from "../../config/logger.js";
import bcrypt from "bcrypt";
import { errorResponse, getImageSingedUrlById, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import User from "../../models/User.js";
import DoctorDetail from "../../models/DoctorDetail.js";

export const doctorList = async (req, res) => {
    try {
        let doctors = await DoctorDetail.find({ isDeleted: false }).populate({
            path: 'designation',
            select: 'designation -_id'
        });
        let doctorList = [];
        for (let doctor of doctors) {
            doctorList.push({ ...doctor._doc, image: await getImageSingedUrlById(doctor.image), designation: doctor?.isHod == true ? "Head Of Dermotology" : doctor?.designation?.designation })
        }
        responseWithData(res, 200, true, "Docter List Fetch Successfully", doctorList);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const addDoctor = async (req, res) => {

    try {
        if (req?.body?.isHod != undefined && req?.body?.isHod == false) {
            let checkAdd = await DoctorDetail.findOne({ isHod: true, isDeleted: false });
            if (checkAdd == null) {
                return responseWithoutData(res, 404, true, "Is Hod Must Be true In a Doctor");
            }
        } else if (req?.body?.isHod != undefined && req?.body?.isHod == true) {
            await DoctorDetail.updateMany({ isDeleted: false }, { $set: { isHod: false } });
        }
        let hashPassword = await bcrypt.hash(req?.body?.password, 10);
        let doctor = await User.create({
            name: req?.body?.name,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
            image: req?.body?.image,
            password: hashPassword,
            type: "doctor",
        });
        if (doctor) {
            let doctorDetails = await DoctorDetail.create({
                userId: doctor?._id.toHexString(),
                image: req?.body?.image,
                name: req?.body?.name,
                email: req?.body?.email,
                password: hashPassword,
                mobile: req?.body?.mobile,
                specialisation: req?.body?.specialisation,
                designation: req?.body?.designation,
                aboutYou: req?.body?.aboutYou,
                medicalCouncilRegNumber: req?.body?.medicalCouncilRegNumber,
                qualifications: req?.body?.qualifications,
                knowAboutMe: req?.body?.knowAboutMe,
                alternativeMobile: req?.body?.alternativeMobile,
                pincode: req?.body?.pincode,
                state: req?.body?.state,
                district: req?.body?.district,
                area: req?.body?.area,
                streetName: req?.body?.streetName,
                houseNumber: req?.body?.houseNumber,
                landmark: req?.body?.landmark,
                patientHandled: req?.body?.patientHandled,
                isHod: req?.body?.isHod,
            });
            if (doctorDetails) {
                return responseWithoutData(res, 200, true, "Doctor Added Successfully");
            } else {
                if (await doctor.delete()) {
                    return responseWithoutData(res, 400, false, "Failed to Added Doctor! Please Try Again");
                }
            }
        } else {
            return responseWithoutData(res, 400, false, "Failed to Added Docter! Please Try Again")
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}


export const getDoctorById = async (req, res) => {
    try {
        let docter = await DoctorDetail.findOne({ _id: req.params.doctorId, isDeleted: false }).populate({
            path: 'designation',
            // select: 'designation -_id' 
        });
        if (docter) {
            docter = { ...docter?._doc, image: await getImageSingedUrlById(docter?._doc?.image), designation: docter?.isHod == true ? "Head Of Dermotology" : docter?.designation?.designation, designationId: docter?.designation?._id }
            responseWithData(res, 200, true, "Doctor Get Successfully", docter);
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
        if (req?.body?.isHod != undefined && req?.body?.isHod == false) {
            let checkAdd = await DoctorDetail.findOne({ isHod: true, isDeleted: false });
            if (checkAdd == null) {
                return responseWithoutData(res, 201, false, "Is Hod Must Be true In a Doctor");
            }
        } else if (req?.body?.isHod != undefined && req?.body?.isHod == true) {
            await DoctorDetail.updateMany({ isDeleted: false }, { $set: { isHod: false } });
        }
        let doctor = await DoctorDetail.findOne({ _id: req?.body?.doctorId, isDeleted: false });
        if (doctor) {
            doctor.name = req?.body?.name ? req?.body?.name : doctor.name;
            doctor.email = req?.body?.email ? req?.body?.email : doctor.email;
            doctor.mobile = req?.body?.mobile ? req?.body?.mobile : doctor.mobile;
            doctor.image = req?.body?.image ? req?.body?.image : doctor.image;
            doctor.specialisation = req?.body?.specialisation ? req?.body?.specialisation : doctor.specialisation;
            doctor.designation = req?.body?.designationId ? req?.body?.designationId : doctor.designation;
            doctor.aboutYou = req?.body?.aboutYou ? req?.body?.aboutYou : doctor.aboutYou;
            doctor.medicalCouncilRegNumber = req?.body?.medicalCouncilRegNumber ? req?.body?.medicalCouncilRegNumber : doctor.medicalCouncilRegNumber;
            doctor.qualifications = req?.body?.qualifications ? req?.body?.qualifications : doctor.qualifications;
            doctor.knowAboutMe = req?.body?.knowAboutMe ? req?.body?.knowAboutMe : doctor.knowAboutMe;
            doctor.alternativeMobile = req?.body?.alternativeMobile ? req?.body?.alternativeMobile : doctor.alternativeMobile;
            doctor.pincode = req?.body?.pincode ? req?.body?.pincode : doctor.pincode;
            doctor.state = req?.body?.state ? req?.body?.state : doctor.state;
            doctor.district = req?.body?.district ? req?.body?.district : doctor.district;
            doctor.area = req?.body?.area ? req?.body?.area : doctor.area;
            doctor.streetName = req?.body?.streetName ? req?.body?.streetName : doctor.streetName;
            doctor.houseNumber = req?.body?.houseNumber ? req?.body?.houseNumber : doctor.houseNumber;
            doctor.landmark = req?.body?.landmark ? req?.body?.landmark : doctor.landmark;
            doctor.patientHandled = req?.body?.patientHandled ? req?.body?.patientHandled : doctor.patientHandled;
            doctor.isHod = req?.body?.isHod ? req?.body?.isHod : doctor.isHod;
            if (await doctor.save()) {
                let user = await User.findOne({ _id: doctor?.userId, type: "doctor", isDeleted: false });
                if (user) {
                    user.name = req?.body?.name ? req?.body?.name : user?.name;
                    user.email = req?.body?.email ? req?.body?.email : user?.email;
                    user.mobile = req?.body?.mobile ? req?.body?.mobile : user?.mobile;
                    if (await user.save()) {
                        responseWithData(res, 200, true, "Doctor Updated Successfully");
                    } else {
                        responseWithoutData(res, 400, false, "Failed to Update Docter! Please Try Again");
                    }
                } else {
                    // let saveDoc = await User.create({
                    //     name    : req?.body?.name,
                    //     email   : req?.body?.email ,
                    //     mobile  : req?.body?.mobile ,
                    //     image   : req?.body?.image,
                    //     type    : "doctor",
                    // });
                    // await DoctorDetail.findOneAndUpdate({ _id: req?.body?.doctorId, isDeleted: false },{$set:{userId:saveDoc?._id}});  
                    responseWithoutData(res, 400, false, "Failed to Update Docter! Please Try Again aaaa");
                }
            } else {
                responseWithoutData(res, 400, false, "Failed to Update Docter! Please Try Again");
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
        let doctor = await DoctorDetail.findOne({ _id: req.params.doctorId, isDeleted: false });
        let user = await User.findOne({ _id: doctor?.userId, type: "doctor", isDeleted: false });
        if (doctor && user) {
            doctor.isDeleted = true;
            user.isDeleted = true;
            if (await doctor.save() && await user.save()) {
                responseWithoutData(res, 200, true, "Doctor Deleted Successfully");
            } else {
                responseWithoutData(res, 400, false, "Failed to delete Doctor");
            }
        } else {
            responseWithoutData(res, 201, false, "Doctor Not Found");
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}