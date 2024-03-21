import { model, Schema } from "mongoose";

const doctorDetailsSchema = Schema({
    userId: { type: Schema.ObjectId, index: true, ref: 'User' },
    name: { type: String, index: true },
    email: { type: String, index: true },
    password: { type: String },
    mobile: { type: Number, index: true },
    mobileOtp: { type: Number },
    image: { type: Schema.Types.ObjectId, index: true },
    specialisation: { type: String, index: true },
    designation: { type: Schema.Types.ObjectId, index: true, ref: 'designation' },
    aboutYou: { type: Array, index: true },
    medicalCouncilRegNumber: { type: String, index: true },
    qualifications: { type: String, index: true },
    knowAboutMe: { type: String, index: true },
    alternativeMobile: { type: Number, index: true },
    pincode: { type: Number, index: true },
    state: { type: String, index: true, default: null },
    district: { type: String, index: true },
    area: { type: String, index: true },
    streetName: { type: String, index: true },
    houseNumber: { type: String, index: true },
    landmark: { type: String, index: true },
    patientHandled: { type: String, index: true },
    isHod: { type: Boolean, index: true, default: false },
    isActive: { type: Boolean, index: true, default: true },
    isDeleted: { type: Boolean, index: true, default: false },
}, { timestamps: true });


export default model('doctordetail', doctorDetailsSchema);