import { model, Schema } from "mongoose";
const userSchema = Schema({
    name: { type: String, index: true },
    email: { type: String, index: true },
    mobile: { type: Number, index: true },
    image: { type: String, default: null, index: true },
    role: { type: String, index: true },
    gender: { type: String, index: true },
    password: { type: String },
    dob: { type: String, index: true },
    age: { type: Number, index: true },
    referralCode: { type: String, index: true },
    referedBy: { type: String, index: true },
    emailOtp: { type: Number },
    isEmailVerify: { type: Boolean, default: false },
    mobileOtp: { type: Number },
    isMobileVerify: { type: Boolean, default: false },
    feedback: { type: Array, index: true, default: [] },
    type: { type: String, enum: ['admin', 'customer', 'doctor', 'employee'], default: 'customer', index: true },
    customerId: { type: String, default: false },
    isRegistered: { type: Boolean, default: false },
    walletPoint: { type: Number, default: 0 },
    hairKitId: { type: String, default: null },
    hairDoctor: { type: String, default: null },
    hairConcern: { type: String, default: null },
    hairKitGenDate: { type: Date, default: null },
    skinKitId: { type: String, default: null },
    skinDoctor: { type: String, default: null },
    skinConcern: { type: String, default: null },
    skinKitGenDate: { type: Date, default: null },
    deviceId: { type: String, index: true, default: null },
    currentWalletPoint: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    hairOptCall: { type: Boolean, default: false },
    skinOptCall: { type: Boolean, default: false },
}, { timestamps: true });


export default model('user', userSchema); 