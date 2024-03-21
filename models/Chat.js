import { model, Schema } from "mongoose";

const chatSchema = Schema({
    message: { type: String, index: true, },
    senderId: { type: Schema.Types.ObjectId, index: true, ref: "user" },
    receiverId: { type: Schema.Types.ObjectId, index: true, ref: "user" },
    isRead: { type: Boolean, default: false },
    type: { type: String, index: true, enum: ["prescription", "regimen"] },
    isImage: { type: Boolean, index: true, default: false },
    isDeleted: { type: Boolean, index: true, default: false },
}, { timestamps: true });

export default model('chat', chatSchema);
