import { model, Schema } from "mongoose";

const prescriptionSchema = Schema({
    title: { type: String, index: true },
    description: { type: String, index: true, default: null },
    isDeleted: { type: Boolean, index: true, default: false },
    addedBy: { type: Schema.Types.ObjectId, index: true, ref: 'doctordetail' },
}, { timestamps: true });

export default model('prescription', prescriptionSchema);