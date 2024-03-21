import { model, Schema } from "mongoose";

const conversationSchema = Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'chat' }],
    status: { type: String, enum: ['complete', 'false', 'true'], default: "false" }
    // Additional fields as needed
}, { timestamps: true });
export default model('conversation', conversationSchema);