import { model, Schema } from "mongoose";

const walletHistorySchema = Schema({
 customerId           : { type:Schema.Types.ObjectId, index: true },
 type                 : { type:String, enum: ['debited', 'credited'], index: true},
 message              : { type: String, index: true  },
 walletPoint          : { type: Number , index:true}
},{timestamps:true});


export default model('walletHistory', walletHistorySchema); 