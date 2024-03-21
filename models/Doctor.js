import { model, Schema } from "mongoose";

const doctorSchema = Schema({
    image           : { type:Schema.Types.ObjectId, index: true },
    name            : { type:String, index: true },
    experties       : { type:String, index: true  },
    patientHandled  : { type:Number, index: true  },
    shortDescription: { type:String, index: true  },
    description     : { type:String, index: true  },
    addedBy         : { type:Schema.Types.ObjectId, index: true },
    isActive        : { type: Boolean, index: true, default:true },
    isDeleted       : { type: Boolean, index: true, default: false },
},{ timestamps: true });
export default model('doctor', doctorSchema);