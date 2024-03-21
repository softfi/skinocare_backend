import { model, Schema } from "mongoose";

const SkinAnalysisNewSchema = Schema({
    customerId                  : { type: Schema.Types.ObjectId, index: true },
    frontFaceImage              : { type: String, index: true },
    leftFaceImage               : { type: String, index: true, default: null },
    rightFaceImage              : { type: String, index: true, default: null },
    brown_area                  : { type: String, index: true, default: null },
    red_area                    : { type: String, index: true, default: null },
    roi_outline_map             : { type: String, index: true, default: null },
    rough_area                  : { type: String, index: true, default: null },
    texture_enhanced_blackheads : { type: String, index: true, default: null }, 
    texture_enhanced_bw         : { type: String, index: true, default: null },
    texture_enhanced_lines      : { type: String, index: true, default: null },
    texture_enhanced_oily_area  : { type: String, index: true, default: null },
    texture_enhanced_pores      : { type: String, index: true, default: null },
    water_area                  : { type: String, index: true, default: null },
    apiResponse                 : { type: JSON, index: true, default: null },
    status                      : { type: Boolean, default: true },
    deletedAt                   : { type: Boolean, default: false },
}, { timestamps: true });

export default model('skin_analysis_new', SkinAnalysisNewSchema); 