import { model, Schema } from "mongoose";

const notificationSchema = Schema(
  {
    customerId  : { type: Schema.Types.ObjectId, index: true },
    title       : { type: String, index: true, default:null },
    body        : { type: String, index: true, default:null  },
    image       : { type: String, index: true, default:null  },
    url         : { type: String, index: true, default:null  },
    isRead      : { type: Boolean, index: true , default:false}
  },
  { timestamps: true } 
);

export default model("notification", notificationSchema);
