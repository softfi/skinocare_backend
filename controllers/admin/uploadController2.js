import { uploadsPath } from "../../config/config.js";
import { errorLog } from "../../config/logger.js";
import { authValues, errorResponse, responseWithData, responseWithoutData, uploadToS3 } from "../../helpers/helper.js";
import Categroy from "../../models/Categroy.js";
import Upload from "../../models/Upload.js";

export const uploadImage = async (req, res) => {
    try {
        if (req.file) {
            let user = await authValues(req.headers['authorization']);
            let fileName = req.body.type.toLowerCase() + '_' + Date.now().toString() + '_' + req.file.originalname;
            let filePath = uploadsPath(req.body.type);
            let imageUrl = await uploadToS3(fileName, filePath, req.file.buffer);
            if (imageUrl) {
                let uploadImage = await Upload.create({
                    fileName: fileName,
                    filePath: filePath,
                    relatedWith: req.body.type,
                    addedBy: user._id,
                });
                responseWithData(res, 200, true, "Image Uploaded Successfully", { uploadImage });
            } else {
                responseWithoutData(res, 501, false, "Image Uploadation failed");
            }
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const uploadImageDoctorSide = async (req, res) => {
    try {
        if (req.file) {
            let doctor = await authValues(req.headers['authorization']);
            let fileName = req.body.type.toLowerCase() + '_' + Date.now().toString() + '_' + req.file.originalname;
            let filePath = uploadsPath(req.body.type);
            let imageUrl = await uploadToS3(fileName, filePath, req.file.buffer);
            if (imageUrl) {
                let uploadImage = await Upload.create({
                    fileName: fileName,
                    filePath: filePath,
                    relatedWith: req.body.type,
                    addedBy: doctor._id,
                });
                console.log("uploadImage", uploadImage)
                responseWithData(res, 200, true, "Image Uploaded Successfully", { uploadImage });
            } else {
                responseWithoutData(res, 501, false, "Image Uploadation failed");
            }
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const uploadMultipleImage = async (req, res) => {
    try {
        if (req.files) {
            let user = await authValues(req.headers['authorization']);
            let uploadedImages = [];
            for (let image of req.files) {
                let fileName = req.body.type.toLowerCase() + '_' + Date.now().toString() + '_' + image.originalname;
                let filePath = uploadsPath(req.body.type);
                let imageUrl = await uploadToS3(fileName, filePath, image.buffer);
                if (imageUrl) {
                    let uploadImage = await Upload.create({
                        fileName: fileName,
                        filePath: filePath,
                        relatedWith: req.body.type,
                        addedBy: user._id,
                    });
                    uploadedImages.push(uploadImage);
                }
            }
            responseWithData(res, 200, true, "Image Uploaded Successfully", { uploadedImages });
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}

export const uploadVideo = async (req, res) => {
    try {
        if (req.file) {
            let user = await authValues(req.headers['authorization']);
            let fileName = req.body.type.toLowerCase() + '_' + Date.now().toString() + '_' + req.file.originalname;
            let filePath = uploadsPath(req.body.type);
            let videoUrl = await uploadToS3(fileName, filePath, req.file.buffer);
            if (videoUrl) {
                let uploadVideo = await Upload.create({
                    fileName: fileName,
                    filePath: filePath,
                    relatedWith: req.body.type,
                    addedBy: user._id,
                });
                responseWithData(res, 200, true, "Video Uploaded Successfully", { uploadVideo });
            } else {
                responseWithoutData(res, 501, false, "Video Uploadation failed");
            }
        }
    } catch (error) {
        errorLog(error);
        errorResponse(res);
    }
}