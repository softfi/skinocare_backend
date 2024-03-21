import { model, Schema } from "mongoose";

const SkinAnalysisSchema = Schema({
    customerId              : { type: Schema.Types.ObjectId, index: true },
    frontFaceImage          : { type: String, index: true },
    leftFaceImage           : { type: String, index: true, default: null },
    rightFaceImage          : { type: String, index: true, default: null },
    resltPimpleImage        : { type: String, index: true, default: null },
    resltblackheadImage     : { type: String, index: true, default: null },
    resltblackheadPoreImage : { type: String, index: true, default: null },
    resltwrinkleImage       : { type: String, index: true, default: null },
    reslteyesattrImage      : { type: String, index: true, default: null },
    resltdarkSpotImage      : { type: String, index: true, default: null },
    srcImage                : { type: String, index: true, default: null },
    grayImage               : { type: String, index: true, default: null },
    brownImage              : { type: String, index: true, default: null },
    redImage                : { type: String, index: true, default: null },
    apiResponse             : { type: JSON, index: true, default: null },
    apiResponseAdvanced     : { type: JSON, index: true, default: null },
    status                  : { type: Boolean, default: true },
    deletedAt               : { type: Boolean, default: false },
}, { timestamps: true });

export default model('skin_analysis', SkinAnalysisSchema);