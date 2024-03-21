import { model,Schema } from "mongoose";

const adminNotificationSchema = Schema({
    title           : { type: String, index: true},
    image           : { type: Schema.Types.ObjectId, index: true},
    description     : { type: String, index:true, default:null },
    isActive        : { type: Boolean, index: true, default:true },
    isDeleted       : { type: Boolean, index: true, default: false },
    addedBy         : { type: Schema.Types.ObjectId, index: true},
},{timestamps:true}); 

export default model('admin_notification', adminNotificationSchema);