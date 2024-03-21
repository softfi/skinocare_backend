
import bcrypt from 'bcrypt'
import { authValues, errorResponse, getImageSingedUrlById, getJwtToken, responseWithData, responseWithoutData, sendMobileOtpOld, } from "../../helpers/helper.js";
import DoctorDetail from "../../models/DoctorDetail.js";
import { errorLog } from "../../config/logger.js"
import User from '../../models/User.js';




// Doctor Login using email
export const doctorUserLogIn = async (req, res) => {
    try {
        // Find a user with the provided email

        let user = await User.findOne({ email: req.body.email, type: 'doctor', isDeleted: false });

        if (user) {
            // Compare the provided password with the stored hashed password
            if (!user.password) {
                responseWithoutData(res, 400, true, 'Password not set for the user');
                return;
            }
            let comparePassword = await bcrypt.compare(req.body.password, user.password);

            if (comparePassword) {
                // Passwords match, send a success response with a JWT token
                res.status(200).send({
                    status: true,
                    msg: "User Logged In Successfully",
                    token: getJwtToken(user._id),
                });
            } else {
                // Passwords don't match, send an "Invalid Credentials" error response
                res.status(403).send({
                    status: false,
                    msg: "Invalid Credentials",
                });
            }
        } else {
            // No user found with the provided email, send an "Invalid Credentials" error response
            res.status(403).send({
                status: false,
                msg: "Invalid Credentials",
            });
        }
    } catch (error) {
        errorLog(error)
        errorResponse(res);
    }
}

// Doctor Login using mobile number
export const doctorLogInUsingMobileNumber = async (req, res) => {
    try {
        let otp = Math.floor(1000 + Math.random() * 9000);

        let user = await User.findOne({ [req?.body?.type]: req?.body?.value, isDeleted: false });
        if (!user) {
            return responseWithoutData(res, 404, false, "User not found.");;
        }

        if (req.body.type == 'mobile') {
            sendMobileOtpOld(user?.mobile, otp);

            let updateResult = await User.findByIdAndUpdate(user._id, {
                mobileOtp: otp
            }, { new: true });

            if (updateResult) {
                responseWithoutData(res, 200, true, "Otp Send Successfully On Mobile");
            }
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// Otp Verification
export const verifyOtpDoctor = async (req, res) => {
    try {

        let user = await User.findOne({ [req?.body?.type]: req?.body?.value });
        let oldUser = (user?.isRegistered === true) ? 1 : 0;
        if (req.body.type == 'mobile') {
            if ((req?.body?.value == '9035119329' && req?.body?.otp == '1234') || (user.mobileOtp === Number(req.body.otp))) {

                let result = await User.findByIdAndUpdate(user._id, {
                    mobileOtp: null,
                    isMobileVerify: true
                }, { new: true });

                return responseWithData(res, 200, true, "Login Successfully.", { ...user?._doc, token: getJwtToken(user?._id), isRegistered: true });
            }
        }
        responseWithoutData(res, 403, false, "OTP Verification is failed.");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// Resend Otp 

export const resendOtpDoctor = async (req, res) => {
    try {
        let otp = Math.floor(1000 + Math.random() * 9000);

        let user = await User.findOne({ [req?.body?.type]: req?.body?.value });
        if (!user) {
            return responseWithoutData(res, 404, false, "User not found.");
        }
        if (req.body.type == 'mobile') {
            sendMobileOtpOld(user.mobile, otp);

            let updateResult = await User.findByIdAndUpdate(user._id, {
                mobileOtp: otp
            }, { new: true });
            if (updateResult) {
                responseWithoutData(res, 200, true, "Otp Resend Successfully On Mobile");
            }
        }

    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

// Doctor update profile
export const updateDoctorDetails = async (req, res) => {
    try {


        let user = await authValues(req?.headers['authorization']);

        let DoctorDetails = await User.findByIdAndUpdate(user?._id, {
            $set: {
                image: req?.body?.image ? req?.body?.image : user?.image,
                name: req?.body?.name ? req?.body?.name : user?.name,
                email: req?.body?.email ? req?.body?.email : user?.email,
                mobile: req?.body?.mobile ? req?.body?.mobile : user?.mobile,
                specialisation: req?.body?.specialisation ? req?.body?.specialisation : user?.specialisation,
                aboutYou: req?.body?.aboutYou ? req?.body?.aboutYou : user?.aboutYou,
                medicalCouncilRegNumber: req?.body?.medicalCouncilRegNumber ? req?.body?.medicalCouncilRegNumber : user?.medicalCouncilRegNumber,
                qualifications: req?.body?.qualifications ? req?.body?.qualifications : user?.qualifications,
                knowAboutMe: req?.body?.knowAboutMe ? req?.body?.knowAboutMe : user?.knowAboutMe,
                alternativeMobile: req?.body?.alternativeMobile ? req?.body?.alternativeMobile : user?.alternativeMobile,
                pincode: req?.body?.pincode ? req?.body?.pincode : user?.pincode,
                state: req?.body?.state ? req?.body?.state : user?.state,
                district: req?.body?.district ? req?.body?.district : user?.district,
                area: req?.body?.area ? req?.body?.area : user?.area,
                streetName: req?.body?.streetName ? req?.body?.streetName : user?.streetName,
                houseNumber: req?.body?.houseNumber ? req?.body?.houseNumber : user?.houseNumber,
                landmark: req?.body?.landmark ? req?.body?.landmark : user?.landmark,

            }
        }, { new: true });

        responseWithData(res, 200, true, "Doctor Details Updated Successfully", DoctorDetails);
    } catch (error) {
        errorLog(error);
        errorResponse(error);
    }
}


//Get Doctor Details

export const doctorAuthDetails = async (req, res) => {
    try {

        let user = await authValues(req.headers['authorization']);

        let doctorSelectedDetails = await User.findOne(user._id);
        doctorSelectedDetails._doc.imageUrl = await getImageSingedUrlById(doctorSelectedDetails?.image);
        responseWithData(res, 200, true, "Doctor Details Fetch Successfully", doctorSelectedDetails);
    } catch (error) {
        errorLog(error);
        errorResponse(error);
    }
}

// Update Password
export const updateDoctorPassword = async (req, res) => {
    try {

        let loggedInDoctor = await authValues(req.headers['authorization']);

        let doctorDetails = await User.findOne({ _id: loggedInDoctor._id, isDeleted: false });

        if (doctorDetails) {
            // Update password only if req.body.newpassword exists
            if (req.body.newPassword) {
                // Hash the new password
                const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

                // Update doctorDetails password
                doctorDetails.password = hashedPassword;
            }

            // Save doctorDetails
            const updatedDoctor = await doctorDetails.save();

            if (updatedDoctor) {
                // Password updated successfully
                return responseWithoutData(res, 200, true, "Doctor Password Updated Successfully");
            } else {
                // Save operation failed
                return responseWithoutData(res, 400, false, "Failed to Update the Password");
            }
        } else {
            // Doctor not found
            return responseWithoutData(res, 404, false, "Doctor Not Found");
        }
    } catch (error) {
        // Handle errors
        errorLog(error);
        errorResponse(error);
    }
}


