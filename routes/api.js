import express from "express";
import cors from "cors";
import { userAuthRoute, userRoute } from "./userRoute.js";
import { adminAuthRoute, adminRoute } from "./adminRoute.js";
import { webRoute } from "./webRoute.js";
import { doctorAuthRoute, doctorRoute } from "./doctorRoute.js"
import { userAuthentication } from "../middlewares/userAuthentication.js";
import { adminAuthentication } from "../middlewares/adminAuthentication.js";
import { errorResponse, getSignedUrl } from "../helpers/helper.js";
import { body } from "express-validator";
import { userValidation } from "../validation/userValidation.js";
import Upload from "../models/Upload.js";
import { errorLog } from "../config/logger.js";
import { docterAuthentication } from "../middlewares/docterAuthentication.js";


export const api = express.Router();

/* Middlewares */
api.use(cors({
    origin: true,
    credentials: true
}));

/****************************
    UNAUTHENTICATED ROUTES
****************************/

api.use('/admin', adminRoute);
api.use('/user', userRoute);
api.use('/web', webRoute);
api.use('/doctor', doctorRoute);

/****************************
    AUTHENTICATED ROUTES
****************************/

api.use('/admin', adminAuthentication, adminAuthRoute);
api.use('/user', userAuthentication, userAuthRoute);
api.use('/doctor', docterAuthentication, doctorAuthRoute);


/****************************
        IMAGE ROUTES URL
****************************/

api.post('/get-uploads-url', [body('uploadId', "Upload Id field  required").notEmpty()], userValidation, async (req, res) => {
    try {
        let uploadData = await Upload.findOne({ _id: req.body.uploadId, isDeleted: false });
        if (uploadData) {
            getSignedUrl(uploadData.filePath + '/' + uploadData.fileName, (err, url) => {
                if (url) {
                    res.status(200).json({
                        status: true,
                        url: url
                    })
                } else {
                    res.status(300).json({
                        status: false
                    })
                }
            });
        } else {
            res.status(501).json({
                status: false,
                msg: "Image Not Found"
            })
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
})