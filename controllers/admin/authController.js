import User from "../../models/User.js";
import bcrypt from "bcrypt";
import { authValues, errorResponse, getImageSingedUrlById, getJwtToken, responseWithData, responseWithoutData } from "../../helpers/helper.js";
import { errorLog } from "../../config/logger.js";

export const adminLogin = async (req, res) => {
    try {
        // Find a user with the provided email
        let admin = await User.findOne({ email: req.body.email, type: 'admin' });
        if (admin) {
            // Compare the provided password with the stored hashed password
            let comparePassword = await bcrypt.compare(req.body.password, admin.password);

            if (comparePassword) {
                // Passwords match, send a success response with a JWT token
                res.status(200).send({
                    status: true,
                    msg: "Admin Logged In Successfully",
                    token: getJwtToken(admin._id),
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

export const getAdminProfileDetails = async (req, res) => {
    try {
        let loggedInUser = await authValues(req.headers['authorization']);
        let adminDetails = await User.findOne({ _id: loggedInUser._id }).select('name email mobile image');
        adminDetails.image ? adminDetails.image = await getImageSingedUrlById(adminDetails.image) : adminDetails.image = "";
        return responseWithData(res, 200, true, "Admin Details Get Successfully", adminDetails);
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const updateAdminProfile = async (req, res) => {
    try {
        let loggedInUser = await authValues(req.headers['authorization']);
        let adminDetails = await User.findOne({ _id: loggedInUser._id, type: "admin", isDeleted: false });
        if (adminDetails) {
            adminDetails.image = req?.body?.image ? req?.body?.image : adminDetails.image;
            adminDetails.name = req?.body?.name ? req?.body?.name : adminDetails.name;
            adminDetails.email = req?.body?.email ? req?.body?.email : adminDetails.email;
            adminDetails.mobile = req?.body?.mobile ? req?.body?.mobile : adminDetails.mobile;
            adminDetails.password = req?.body?.newpassword ? await bcrypt.hash(req?.body?.newpassword, 10) : adminDetails.password;
            if (await adminDetails.save()) {
                return responseWithoutData(res, 200, true, "Admin Profile Updated Successfully");
            }
            return responseWithoutData(res, 400, false, "Failed to Update the Profile");
        }
        return responseWithoutData(res, 404, false, "Admin Not Found");
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}